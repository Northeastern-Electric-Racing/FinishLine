import { Prisma } from '@prisma/client';
import { User } from 'shared';

const userTransformer = (user: Prisma.UserGetPayload<null>): User => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailId: user.emailId,
    role: user.role,
    favoriteProjects: user.
  };
};

export default userTransformer;
