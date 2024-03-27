import { Role } from '@prisma/client';
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
}: CreateTestUserParams): Promise<void> => {
  await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      googleAuthId,
      role
    }
  });
};
