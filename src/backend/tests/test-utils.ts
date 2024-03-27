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

export const resetUsers = async () => {
  await prisma.material.deleteMany();
  await prisma.manufacturer.deleteMany();
  await prisma.material_Type.deleteMany();
  await prisma.assembly.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user_Secure_Settings.deleteMany();
  await prisma.reimbursement_Product.deleteMany();
  await prisma.reimbursement_Status.deleteMany();
  await prisma.reimbursement_Request.deleteMany();
  await prisma.task.deleteMany();
  await prisma.stage_Gate_CR.deleteMany();
  await prisma.activation_CR.deleteMany();
  await prisma.change.deleteMany();
  await prisma.proposed_Solution.deleteMany();
  await prisma.scope_CR_Why.deleteMany();
  await prisma.scope_CR.deleteMany();
  await prisma.change_Request.deleteMany();
  await prisma.link.deleteMany();
  await prisma.linkType.deleteMany();
  await prisma.work_Package_Template.deleteMany();
  await prisma.user_Settings.deleteMany();
  await prisma.user.deleteMany();
};
