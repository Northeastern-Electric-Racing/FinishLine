import { User_Settings, User as PrismaUser, User } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import {
  Role,
  ThemeName,
  rankUserRole,
  User as SharedUser,
  Project,
  RoleEnum,
  isHead,
  UserSecureSettings,
  UserScheduleSettings,
  UserWithScheduleSettings,
  AuthenticatedUser,
  AvailabilityCreateArgs
} from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils';
import { generateAccessToken } from '../utils/auth.utils';
import projectTransformer from '../transformers/projects.transformer';
import { getProjectQueryArgs } from '../prisma-query-args/projects.query-args';
import userSecureSettingsTransformer from '../transformers/user-secure-settings.transformer';
import { validateUserIsPartOfFinanceTeamOrAdmin } from '../utils/reimbursement-requests.utils';
import userScheduleSettingsTransformer from '../transformers/user-schedule-settings.transformer';
import { userTransformer, userWithScheduleSettingsTransformer } from '../transformers/user.transformer';
import { getUserRole, updateUserAvailability } from '../utils/users.utils';
import {
  getUserQueryArgs,
  getUserScheduleSettingsQueryArgs,
  getUserWithSettingsQueryArgs
} from '../prisma-query-args/user.query-args';
import { getAuthUserQueryArgs } from '../prisma-query-args/auth-user.query-args';
import authenticatedUserTransformer from '../transformers/auth-user.transformer';

export default class UsersService {
  /**
   * Gets all of the users from the database
   * @param organizationId the id of the organization to get the users for
   * @returns a list of all the users
   */
  static async getAllUsers(organizationId?: string): Promise<UserWithScheduleSettings[]> {
    if (!organizationId) {
      const users = await prisma.user.findMany({
        include: {
          roles: true,
          userSettings: true,
          drScheduleSettings: getUserScheduleSettingsQueryArgs(),
          organizations: true
        }
      });

      return users.map(userWithScheduleSettingsTransformer);
    }

    const organization = await prisma.organization.findUnique({
      where: { organizationId },
      include: {
        users: getUserWithSettingsQueryArgs(organizationId)
      }
    });

    if (!organization) throw new NotFoundException('Organization', organizationId);

    const { users } = organization;
    users.sort((a, b) => a.firstName.localeCompare(b.firstName));

    return users.map(userWithScheduleSettingsTransformer);
  }

  /**
   * Gets the user with the specified id
   * @param userId the id of the user that's returned
   * @param organizationId the id of the organization the current user is in
   * @returns the user with the specified id
   * @throws if the given user doesn't exist
   */
  static async getSingleUser(userId: string, organizationId: string): Promise<SharedUser> {
    const requestedUser = await prisma.user.findUnique({ where: { userId }, ...getUserQueryArgs(organizationId) });
    if (!requestedUser) throw new NotFoundException('User', userId);
    if (!requestedUser.organizations.map((org) => org.organizationId).includes(organizationId))
      throw new AccessDeniedException('User not in organization');

    return userTransformer(requestedUser);
  }

  /**
   * Gets the user settings for a specified user
   * @param userId the id of the user who's settings are requested
   * @returns the user settings object
   * @throws if the given user doesn't exist, or the given user's settings don't exist
   */
  static async getUserSettings(userId: string): Promise<User_Settings> {
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
   * Get the given user's favorite projects for the current organization.
   * @param userId the user to get the projects for
   * @param organizationId the id of the organization the user is in
   * @returns the user's favorite projects
   */
  static async getUsersFavoriteProjects(userId: string, organizationId: string): Promise<Project[]> {
    const requestedUser = await prisma.user.findUnique({ where: { userId } });
    if (!requestedUser) throw new NotFoundException('User', userId);

    const projects = await prisma.project.findMany({
      where: {
        favoritedBy: {
          some: {
            userId
          }
        },
        wbsElement: {
          organizationId
        }
      },
      ...getProjectQueryArgs(organizationId)
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
      include: {
        organizations: true,
        userSettings: true
      }
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
      const organization = await prisma.organization.findFirst();

      const createdUser = await prisma.user.create({
        data: {
          firstName: payload['given_name'],
          lastName: payload['family_name'],
          googleAuthId: userId,
          email: payload['email'],
          emailId,
          userSettings: { create: {} }
        },
        include: {
          organizations: true,
          userSettings: true
        }
      });
      user = createdUser;

      if (organization) {
        await prisma.organization.update({
          where: { organizationId: organization.organizationId },
          data: {
            users: {
              connect: {
                userId: createdUser.userId
              }
            }
          }
        });
        await prisma.role.create({
          data: {
            userId: createdUser.userId,
            organizationId: organization!.organizationId,
            roleType: RoleEnum.GUEST
          }
        });
      }
    }

    // register a login
    await prisma.session.create({
      data: {
        userId: user.userId,
        deviceInfo: header
      }
    });

    const token = generateAccessToken({ userId: user.userId, firstName: user.firstName, lastName: user.lastName });

    if (user.organizations.length > 0) {
      const [defaultOrganization] = user.organizations;
      const authenticatedUser = await prisma.user.findUnique({
        where: { userId: user.userId },
        ...getAuthUserQueryArgs(defaultOrganization.organizationId)
      });

      if (!authenticatedUser) throw new NotFoundException('User', userId);

      return { user: authenticatedUserTransformer(authenticatedUser), token };
    }

    return {
      user: authenticatedUserTransformer({
        ...user,
        organizations: [],
        favoriteProjects: [],
        changeRequestsToReview: [],
        teamsAsHead: [],
        teamsAsLead: [],
        teamsAsMember: [],
        roles: []
      }),
      token
    };
  }

  /**
   * Logs a user in on the development version of the app
   * @param userId the user id of the user being logged in
   * @param header additional information used to register a login
   * @returns the user that has been logged in
   * @throws if the user with the specified id doesn't exist in the database
   */
  static async logUserInDev(userId: string, header: string): Promise<AuthenticatedUser> {
    const user = await prisma.user.findUnique({
      where: { userId },
      include: {
        organizations: true,
        userSettings: true
      }
    });

    if (!user) throw new NotFoundException('User', userId);

    // register a login
    await prisma.session.create({
      data: {
        userId: user.userId,
        deviceInfo: header
      }
    });

    if (user.organizations.length > 0) {
      const [defaultOrganization] = user.organizations;
      const authenticatedUser = await prisma.user.findUnique({
        where: { userId },
        ...getAuthUserQueryArgs(defaultOrganization.organizationId)
      });

      if (!authenticatedUser) throw new NotFoundException('User', userId);

      return authenticatedUserTransformer(authenticatedUser);
    }

    return authenticatedUserTransformer({
      ...user,
      organizations: [],
      favoriteProjects: [],
      changeRequestsToReview: [],
      teamsAsHead: [],
      teamsAsLead: [],
      teamsAsMember: [],
      roles: []
    });
  }

  /**
   * Edits a user's role
   * @param targetUserId the user who's role is being changed
   * @param user the user who is changing the role
   * @param role the role that the user is being updated to
   * @param organizationId the id of the organization the user is in
   * @returns the user whose role has been updated
   * @throws if the targeted user doesn't exist, the user who's changing the role doesn't exist,
   *         a user is trying to change the role of a user with an equal or higher role, or a user is trying to
   *         promote a user to higher role than themself
   */
  static async updateUserRole(
    targetUserId: string,
    user: PrismaUser,
    role: Role,
    organizationId: string
  ): Promise<SharedUser> {
    const targetUser = await prisma.user.findUnique({
      where: { userId: targetUserId },
      ...getUserQueryArgs(organizationId)
    });

    if (!targetUser) throw new NotFoundException('User', targetUserId);
    if (!targetUser.organizations.map((org) => org.organizationId).includes(organizationId))
      throw new InvalidOrganizationException('User');

    const userRole = await getUserRole(user.userId, organizationId);
    const targetUserRole = await getUserRole(targetUserId, organizationId);
    const userRankedRole = rankUserRole(userRole);
    const targetUserRankedRole = rankUserRole(targetUserRole);

    if (!isHead(userRole)) {
      throw new AccessDeniedException('Guests, members, and leadership cannot update user roles!');
    }

    if (targetUserRankedRole >= userRankedRole) {
      throw new AccessDeniedException('Cannot change the role of a user with an equal or higher role than you');
    }

    if (userRole === RoleEnum.HEAD && rankUserRole(role) >= userRankedRole) {
      throw new AccessDeniedException('Heads can only promote to leadership or below');
    } else {
      if (rankUserRole(role) > userRankedRole) {
        throw new AccessDeniedException('Cannot promote user to a higher role than yourself');
      }

      await prisma.role.upsert({
        where: { uniqueRole: { userId: targetUserId, organizationId } },
        update: { roleType: role },
        create: { userId: targetUserId, organizationId, roleType: role }
      });
    }

    return userTransformer(targetUser);
  }

  /**
   * Gets a user's secure settings
   * @param userId the id of user who's secure settings are being returned
   * @param submitter the user who is requesting the user's secure settings
   * @param organizationId the id of the organization the user is in
   */
  static async getUserSecureSetting(
    userId: string,
    submitter: PrismaUser,
    organizationId: string
  ): Promise<UserSecureSettings> {
    await validateUserIsPartOfFinanceTeamOrAdmin(submitter, organizationId);
    const secureSettings = await prisma.user_Secure_Settings.findUnique({
      where: { userId },
      include: {
        user: {
          include: {
            organizations: true
          }
        }
      }
    });

    if (!secureSettings) throw new HttpException(404, 'User Secure Settings Not Found');
    const { user } = secureSettings;

    if (!user) throw new NotFoundException('User', userId);
    if (!user.organizations.map((org) => org.organizationId).includes(organizationId))
      throw new AccessDeniedException('This user is not in your organization!');

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
  static async getUserScheduleSettings(userId: string, submitter: PrismaUser): Promise<UserScheduleSettings> {
    if (submitter.userId !== userId) throw new AccessDeniedException('You can only access your own schedule settings');
    const scheduleSettings = await prisma.schedule_Settings.findUnique({
      where: { userId },
      ...getUserScheduleSettingsQueryArgs()
    });
    if (!scheduleSettings) throw new HttpException(404, 'User Schedule Settings Not Found');

    return userScheduleSettingsTransformer(scheduleSettings);
  }

  /**
   *
   * @param user the user to set the schedule settings for
   * @param personalGmail the user's personal gmail
   * @param personalZoomLink the user's personal zoom link
   * @param availabilities the user's availibility
   * @returns the id of the user's schedule settings
   */
  static async setUserScheduleSettings(
    user: User,
    personalGmail: string,
    personalZoomLink: string,
    availabilities: AvailabilityCreateArgs[]
  ): Promise<UserScheduleSettings> {
    if (personalGmail !== '') {
      const existingUser = await prisma.schedule_Settings.findFirst({
        where: { personalGmail, userId: { not: user.userId } } // excludes the current user from check
      });

      if (existingUser) {
        throw new HttpException(400, 'Email already in use');
      }
    }

    const newUserScheduleSettings = await prisma.schedule_Settings.upsert({
      where: { userId: user.userId },
      update: {
        personalGmail,
        personalZoomLink
      },
      create: {
        userId: user.userId,
        personalGmail,
        personalZoomLink
      },
      ...getUserScheduleSettingsQueryArgs()
    });

    await updateUserAvailability(availabilities, newUserScheduleSettings, user);

    return userScheduleSettingsTransformer(newUserScheduleSettings);
  }
}
