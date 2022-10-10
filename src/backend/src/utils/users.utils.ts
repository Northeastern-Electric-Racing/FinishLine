import { Prisma, Role } from '@prisma/client';
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
    case 'GUEST':
      return 1;
  }
};

export const resolveUserRole = (rank: number) => {
  switch (rank) {
    case 5:
      return 'APP_ADMIN';
    case 4:
      return 'ADMIN';
    case 3:
      return 'LEADERSHIP';
    case 2:
      return 'MEMBER';
    case 1:
      return 'GUEST';
  }
};