import { Role } from '@prisma/client';
import prisma from '../prisma/prisma';

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
