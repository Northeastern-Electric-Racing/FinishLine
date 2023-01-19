import { Role, User_Settings, User as PrismaUser } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { AuthenticatedUser, User } from 'shared';
import authUserQueryArgs from '../prisma-query-args/auth-user.query-args';
import prisma from '../prisma/prisma';
import authenticatedUserTransformer from '../transformers/auth-user.transformer';
import userTransformer from '../transformers/user.transformer';
import { AccessDeniedException, NotFoundException } from '../utils/errors.utils';
import { rankUserRole } from '../utils/users.utils';
import { generateAccessToken } from '../utils/utils';

export default class UsersService {
  /**
   * Gets all of the users from the database
   * @returns a list of all the users
   */
  static async getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany();
    users.sort((a, b) => a.firstName.localeCompare(b.firstName));

    return users.map(userTransformer);
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
   * @param userId the id of the user's settings
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

    if (!settings) throw new NotFoundException('User Settings', userId);

    return settings;
  }

  /**
   * Edits a user's settings in the database
   * @param user the user who's settings are being updated
   * @param defaultTheme the defaultTheme of the user - a setting
   * @param slackId the user's slackId - a setting
   * @returns the updated settings
   * @throws if the user does not exist
   */
  static async updateUserSettings(user: PrismaUser, defaultTheme: any, slackId: string): Promise<User_Settings> {
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

    // if not in database, create user in database
    if (!user) {
      const emailId = payload['email']!.includes('@husky.neu.edu') ? payload['email']!.split('@')[0] : null;
      const createdUser = await prisma.user.create({
        data: {
          firstName: payload['given_name']!,
          lastName: payload['family_name']!,
          googleAuthId: userId,
          email: payload['email']!,
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

    if (user.role !== Role.APP_ADMIN && user.role !== Role.ADMIN) {
      throw new AccessDeniedException('Only admins can update user roles!');
    }

    if (rankUserRole(role) > userRole) throw new AccessDeniedException('Cannot promote user to a higher role than yourself');

    if (targetUserRole >= userRole) {
      throw new AccessDeniedException('Cannot change the role of a user with an equal or higher role than you');
    }

    targetUser = await prisma.user.update({
      where: { userId: targetUserId },
      data: { role }
    });

    return userTransformer(targetUser);
  }
}
