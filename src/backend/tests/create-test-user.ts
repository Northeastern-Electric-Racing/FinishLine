import { Role, User } from '@prisma/client';
import prisma from '../src/prisma/prisma';

interface CreateTestUserParams {
  userId?: number;
  firstName: string;
  lastName: string;
  email: string;
  emailId?: string | null;
  googleAuthId: string;
  role: Role;
}

export const createTestUser = async ({
  firstName,
  lastName,
  email,
  googleAuthId,
  role
}: CreateTestUserParams): Promise<User> => {
  const createdUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      googleAuthId,
      role
    }
  });
  return createdUser;
};
