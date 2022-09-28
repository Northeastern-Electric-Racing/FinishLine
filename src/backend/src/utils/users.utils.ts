import { Prisma } from '@prisma/client';
import { AuthenticatedUser, User } from 'shared';
import prisma from '../prisma/prisma';

export const authUserQueryArgs = Prisma.validator<Prisma.UserArgs>()({
  include: {
    userSettings: true
  }
});

export const authenticatedUserTransformer = (
  user: Prisma.UserGetPayload<typeof authUserQueryArgs>
): AuthenticatedUser => {
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
  if (user === null) throw new TypeError('User not found');

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
