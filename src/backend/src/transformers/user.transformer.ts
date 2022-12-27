import { Prisma } from '@prisma/client';
import { User } from 'shared';

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
