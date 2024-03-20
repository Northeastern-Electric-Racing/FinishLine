import { User_Settings, User as PrismaUser } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import {
  AuthenticatedUser,
  Role,
  ThemeName,
  User,
  rankUserRole,
  Project,
  RoleEnum,
  isHead,
  UserSecureSettings,
  UserScheduleSettings,
  UserWithScheduleSettings
} from 'shared';
import authUserQueryArgs from '../prisma-query-args/auth-user.query-args';
import prisma from '../prisma/prisma';
import authenticatedUserTransformer from '../transformers/auth-user.transformer';
import userTransformer from '../transformers/user.transformer';
import { AccessDeniedException, HttpException, NotFoundException } from '../utils/errors.utils';
import { generateAccessToken } from '../utils/auth.utils';
import projectTransformer from '../transformers/projects.transformer';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import userSecureSettingsTransformer from '../transformers/user-secure-settings.transformer';
import { validateUserIsPartOfFinanceTeam } from '../utils/reimbursement-requests.utils';
import userScheduleSettingsTransformer from '../transformers/user-schedule-settings.transformer';
import userWithScheduleSettingsTransformer from '../transformers/designReviewUser.transformer';

export default class UsersService {
  /**
   * Gets all of the users from the database
   * @returns a list of all the users
   */
  static async getAllUsers(): Promise<UserWithScheduleSettings[]> {
    const users = await prisma.user.findMany({
      include: {
        drScheduleSettings: true
      }
    });
    users.sort((a, b) => a.firstName.localeCompare(b.firstName));

    return users.map(userWithScheduleSettingsTransformer);
  }

  /**
   * Gets the user with the specified id
   * @param userId the id of the user that's returned
   * @returns the user with the specified id
   * @throws if the given user doesn't exist
   */
  static async getSingleUser(userId: number): Promise<User> {
    const requestedUser = await prisma.user.findUnique({ where: { userId } });
    if (!requestedUser) throw new NotFoundException('User', userId);

    return userTransformer(requestedUser);
  }

  /**
   * Gets the user settings for a specified user
   * @param userId the id of the user who's settings are requested
   * @returns the user settings object
   * @throws if the given user doesn't exist, or the given user's settings don't exist
   */
  static async getUserSettings(userId: number): Promise<User_Settings> {
    const requestedUser = await prisma.user.findUnique({ where: { userId } });

    if (!requestedUser) throw new NotFoundException('User', userId);
    const settings = await prisma.user_Settings.upsert({
      where: { userId },
      update: {},
      create: { userId }
    });

    return settings;
  }

  /**
   * Gets the user secure settings for the current usr
   * @param user the id of the user who's secure settings are requested
   * @returns the user's secure settings object
   */
  static async getCurrentUserSecureSettings(user: PrismaUser): Promise<UserSecureSettings> {
    const secureSettings = await prisma.user_Secure_Settings.findUnique({
      where: { userId: user.userId }
    });
    if (!secureSettings) throw new HttpException(404, 'User Secure Settings Not Found');

    return userSecureSettingsTransformer(secureSettings);
  }

  /**
   * Get the given user's favorite projects.
   * @param userId the user to get the projects for
   * @returns the user's favorite projects
   */
  static async getUsersFavoriteProjects(userId: number): Promise<Project[]> {
    const requestedUser = await prisma.user.findUnique({ where: { userId } });
    if (!requestedUser) throw new NotFoundException('User', userId);

    const projects = await prisma.project.findMany({
      where: {
        favoritedBy: {
          some: {
            userId
          }
        }
      },
      ...projectQueryArgs
    });

    return projects.map(projectTransformer);
  }

  /**
   * Edits a user's settings in the database
   * @param user the user who's settings are being updated
   * @param defaultTheme the defaultTheme of the user - a setting
   * @param slackId the user's slackId - a setting
   * @returns the updated settings
   * @throws if the user does not exist
   */
  static async updateUserSettings(user: PrismaUser, defaultTheme: ThemeName, slackId: string): Promise<User_Settings> {
    const { userId } = user;

    const updatedSettings = await prisma.user_Settings.upsert({
      where: { userId },
      update: { defaultTheme, slackId },
      create: { userId, defaultTheme, slackId }
    });

    return updatedSettings;
  }

  /**
   * Logs a user in on production
   * @param idToken the idToken of the user logging in
   * @param header additional information used to register a login
   * @returns the user that has been signed in, and an access token
   * @throws if the auth server response payload is invalid
   */
  static async logUserIn(idToken: string, header: string): Promise<{ user: AuthenticatedUser; token: string }> {
    const client = new OAuth2Client(process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.REACT_APP_GOOGLE_AUTH_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error('Auth server response payload invalid');
    const { sub: userId } = payload; // google user id
    // check if user is already in the database via Google ID
    let user = await prisma.user.findUnique({
      where: { googleAuthId: userId },
      ...authUserQueryArgs
    });

    if (!payload['given_name']) {
      throw new HttpException(400, 'First Name was not Found on Google Account');
    }

    if (!payload['family_name']) {
      throw new HttpException(400, 'Last Name was not Found on Google Account');
    }

    if (!payload['email']) {
      throw new HttpException(400, 'Email was not Found on Google Account');
    }

    // if not in database, create user in database
    if (!user) {
      const emailId = payload['email']!.includes('@husky.neu.edu') ? payload['email']!.split('@')[0] : null;
      const createdUser = await prisma.user.create({
        data: {
          firstName: payload['given_name'],
          lastName: payload['family_name'],
          googleAuthId: userId,
          email: payload['email'],
          emailId,
          userSettings: { create: {} }
        },
        ...authUserQueryArgs
      });
      user = createdUser;
    }

    // register a login
    await prisma.session.create({
      data: {
        userId: user.userId,
        deviceInfo: header
      }
    });

    const token = generateAccessToken({ userId: user.userId, firstName: user.firstName, lastName: user.lastName });

    return { user: authenticatedUserTransformer(user), token };
  }

  /**
   * Logs a user in on the development version of the app
   * @param userId the user id of the user being logged in
   * @param header additional information used to register a login
   * @returns the user that has been logged in
   * @throws if the user with the specified id doesn't exist in the database
   */
  static async logUserInDev(userId: number, header: string): Promise<AuthenticatedUser> {
    const user = await prisma.user.findUnique({
      where: { userId },
      ...authUserQueryArgs
    });

    if (!user) throw new NotFoundException('User', userId);

    // register a login
    await prisma.session.create({
      data: {
        userId: user.userId,
        deviceInfo: header
      }
    });

    return authenticatedUserTransformer(user);
  }

  /**
   * Edits a user's role
   * @param targetUserId the user who's role is being changed
   * @param user the user who is changing the role
   * @param role the role that the user is being updated to
   * @returns the user whose role has been updated
   * @throws if the targeted user doesn't exist, the user who's changing the role doesn't exist,
   *         a user is trying to change the role of a user with an equal or higher role, or a user is trying to
   *         promote a user to higher role than themself
   */
  static async updateUserRole(targetUserId: number, user: PrismaUser, role: Role): Promise<User> {
    let targetUser = await prisma.user.findUnique({ where: { userId: targetUserId } });

    if (!targetUser) throw new NotFoundException('User', targetUserId);

    const userRole = rankUserRole(user.role);
    const targetUserRole = rankUserRole(targetUser.role);

    if (!isHead(user.role)) {
      throw new AccessDeniedException('Guests, members, and leadership cannot update user roles!');
    }

    if (targetUserRole >= userRole) {
      throw new AccessDeniedException('Cannot change the role of a user with an equal or higher role than you');
    }

    if (user.role === RoleEnum.HEAD && rankUserRole(role) >= userRole) {
      throw new AccessDeniedException('Heads can only promote to leadership or below');
    } else {
      if (rankUserRole(role) > userRole) {
        throw new AccessDeniedException('Cannot promote user to a higher role than yourself');
      }
      targetUser = await prisma.user.update({
        where: { userId: targetUserId },
        data: { role }
      });
    }

    return userTransformer(targetUser);
  }

  /**
   * Gets a user's secure settings
   * @param userId the id of user who's secure settings are being returned
   * @param submitter the user who is requesting the user's secure settings
   */
  static async getUserSecureSetting(userId: number, submitter: PrismaUser): Promise<UserSecureSettings> {
    await validateUserIsPartOfFinanceTeam(submitter);
    const secureSettings = await prisma.user_Secure_Settings.findUnique({
      where: { userId }
    });
    if (!secureSettings) throw new HttpException(404, 'User Secure Settings Not Found');

    return userSecureSettingsTransformer(secureSettings);
  }

  /**
   * Sets the user's secure settings
   * @param user the user to set the secure settings for
   * @param nuid the users nuid
   * @param street the users street address
   * @param city the users city
   * @param state the users state
   * @param zipcode the users zipcode
   * @returns the id of the user's secure settings
   */
  static async setUserSecureSettings(
    user: User,
    nuid: string,
    street: string,
    city: string,
    state: string,
    zipcode: string,
    phoneNumber: string
  ): Promise<string> {
    const existingUser = await prisma.user_Secure_Settings.findFirst({
      where: { phoneNumber, userId: { not: user.userId } } // excludes the current user from check
    });

    if (existingUser) {
      throw new HttpException(400, 'Phone number already in use');
    }

    const newUserSecureSettings = await prisma.user_Secure_Settings.upsert({
      where: { userId: user.userId },
      update: {
        nuid,
        street,
        city,
        state,
        zipcode,
        phoneNumber
      },
      create: {
        userId: user.userId,
        nuid,
        street,
        city,
        state,
        zipcode,
        phoneNumber
      }
    });

    return newUserSecureSettings.userSecureSettingsId;
  }

  /**
   * Gets a user's schedule settings
   * @param userId the id of the user who's schedule settings are being returned
   * @param submitter the user who's requesting the schedule settings
   * @returns the user's schedule settings
   * @throws if the user doesn't have schedule settings
   */
  static async getUserScheduleSettings(userId: number, submitter: PrismaUser): Promise<UserScheduleSettings> {
    if (submitter.userId !== userId) throw new AccessDeniedException('You can only access your own schedule settings');
    const scheduleSettings = await prisma.schedule_Settings.findUnique({
      where: { userId }
    });
    if (!scheduleSettings) throw new HttpException(404, 'User Schedule Settings Not Found');

    return userScheduleSettingsTransformer(scheduleSettings);
  }

  /**
   *
   * @param user the user to set the schedule settings for
   * @param personalGmail the user's personal gmail
   * @param personalZoomLink the user's personal zoom link
   * @param availability the user's availibility
   * @returns the id of the user's schedule settings
   */
  static async setUserScheduleSettings(
    user: User,
    personalGmail: string,
    personalZoomLink: string,
    availability: number[]
  ): Promise<UserScheduleSettings> {
    const existingUser = await prisma.schedule_Settings.findFirst({
      where: { personalGmail, userId: { not: user.userId } } // excludes the current user from check
    });

    if (existingUser) {
      throw new HttpException(400, 'Email already in use');
    }

    const newUserScheduleSettings = await prisma.schedule_Settings.upsert({
      where: { userId: user.userId },
      update: {
        personalGmail,
        personalZoomLink,
        availability
      },
      create: {
        userId: user.userId,
        personalGmail,
        personalZoomLink,
        availability
      }
    });
    return userScheduleSettingsTransformer(newUserScheduleSettings);
  }
}
