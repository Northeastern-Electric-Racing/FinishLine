import { Role } from '@prisma/client';
import prisma from '../prisma/prisma';
import { HttpException } from './errors.utils';

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
 * @returns array of User
 * @throws if any user does not exist
 */
export const getUsers = async (userIds: number[]): Promise<User[]> => {
  const users = await prisma.user.findMany({
    where: { userId: { in: userIds } }
  });

  if (users.length !== userIds.length) {
    const prismaUserIds = users.map((user) => user.userId);
    const missingUserIds = userIds.filter((id) => !prismaUserIds.includes(id));
    throw new HttpException(404, `User(s) with the following ids not found: ${missingUserIds.join(', ')}`);
  }

  return users;
};
