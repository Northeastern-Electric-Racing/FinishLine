import { Role, User_Settings } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library/build/src/auth/oauth2client';
import { AuthenticatedUser, User } from 'shared';
import { authUserQueryArgs } from '../prisma-query-args/auth-user.query-args';
import prisma from '../prisma/prisma';
import { authenticatedUserTransformer } from '../transformers/auth-user.transformer';
import { userTransformer } from '../transformers/user.transformer';
import { AccessDeniedException, NotFoundException } from '../utils/errors.utils';
import { rankUserRole } from '../utils/users.utils';

export default class UsersService {
  static async getAllUsers(): Promise<User[]> {
    const users = await prisma.user.findMany();
    users.sort((a, b) => a.firstName.localeCompare(b.firstName));

    return users.map(userTransformer);
  }

  static async getSingleUser(userId: number): Promise<User> {
    const requestedUser = await prisma.user.findUnique({ where: { userId } });
    if (!requestedUser) throw new NotFoundException('User', userId);

    return userTransformer(requestedUser);
  }

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

  static async updateUserSettings(userId: number, defaultTheme: any, slackId: string): Promise<User_Settings> {
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) throw new NotFoundException('User', userId);

    const updatedSettings = await prisma.user_Settings.upsert({
      where: { userId },
      update: { defaultTheme, slackId },
      create: { userId, defaultTheme, slackId }
    });

    return updatedSettings;
  }

  static async logUserIn(idToken: string, header: string): Promise<AuthenticatedUser> {
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

    return authenticatedUserTransformer(user);
  }

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

  static async updateUserRole(targetUserId: number, userId: number, role: Role): Promise<User> {
    const user = await prisma.user.findUnique({ where: { userId } });

    let targetUser = await prisma.user.findUnique({ where: { userId: targetUserId } });

    if (!user) throw new NotFoundException('User', userId);

    if (!targetUser) throw new NotFoundException('User', targetUserId);

    const userRole = rankUserRole(user.role);
    const targetUserRole = rankUserRole(targetUser.role);

    if (rankUserRole(role) > userRole) throw new AccessDeniedException('Cannot promote user to a higher role than yourself');

    if (targetUserRole >= userRole)
      throw new AccessDeniedException('Cannot change the role of a user with an equal or higher role than you');

    targetUser = await prisma.user.update({
      where: { userId: targetUserId },
      data: { role }
    });

    return userTransformer(targetUser);
  }
}
