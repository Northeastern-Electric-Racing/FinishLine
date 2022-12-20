import { Prisma, Role } from '@prisma/client';
import { AuthenticatedUser, User } from 'shared';
import prisma from '../prisma/prisma';
import { HttpException } from './errors.utils';

export const authUserQueryArgs = Prisma.validator<Prisma.UserArgs>()({
  include: {
    userSettings: true
  }
});

export const authenticatedUserTransformer = (user: Prisma.UserGetPayload<typeof authUserQueryArgs>): AuthenticatedUser => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailId: user.emailId,
    role: user.role,
    defaultTheme: user.userSettings?.defaultTheme
  };
};

export const userTransformer = (user: Prisma.UserGetPayload<null>): User => {
  return {
    userId: user.userId ?? undefined,
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    email: user.email ?? undefined,
    emailId: user.emailId,
    role: user.role ?? undefined
  };
};

export const getUserFullName = async (userId: number | null) => {
  if (!userId) return 'no one';
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) return 'no one';
  return `${user.firstName} ${user.lastName}`;
};

export const rankUserRole = (role: Role) => {
  switch (role) {
    case 'APP_ADMIN':
      return 5;
    case 'ADMIN':
      return 4;
    case 'LEADERSHIP':
      return 3;
    case 'MEMBER':
      return 2;
    default:
      return 1;
  }
};

/**
 * Produce a array of User with given userIds
 * @param userIds array of userIds as an array of integers
 * @returns array of User with type = User[]
 * @throws if any user does not exist
 */
export const getUsers = async (userIds: number[]) => {
  const missingUserIds: number[] = [];

  const users = await Promise.all(
    userIds.map(async (userId: number) => await prisma.user.findUnique({ where: { userId } }))
  );

  // track any missing user from given userIds
  users.forEach((user, index) => {
    if (user === null) missingUserIds.push(userIds[index]);
  });

  if (missingUserIds.length > 0)
    throw new HttpException(404, `${`user with the following ids not found: ${missingUserIds.join(', ')}`}`);

  return users as User[];
};
