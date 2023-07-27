import { User, User_Settings } from '@prisma/client';
import prisma from '../prisma/prisma';
import { HttpException, NotFoundException } from './errors.utils';

type UserWithSettings = ({
  userSettings: User_Settings | null;
} & User)[];

export const getUserFullName = async (userId: number | null) => {
  if (!userId) return 'no one';
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) return 'no one';
  return `${user.firstName} ${user.lastName}`;
};

export const getUserSlackId = async (userId?: number): Promise<string | undefined> => {
  if (!userId) return undefined;
  const user = await prisma.user.findUnique({ where: { userId }, include: { userSettings: true } });
  if (!user) throw new NotFoundException('User', userId);
  return user.userSettings?.slackId;
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

  areUsersAndIdsMatch(users, userIds);

  return users;
};

/**
 * Gets the users for the given Ids with their user settings
 * @param userIds array of userIds as an array of integers
 * @returns the found users with their user settings
 * @throws if any user does not exist
 */
export const getUsersSettings = async (userIds: number[]): Promise<UserWithSettings> => {
  const users = await prisma.user.findMany({
    where: { userId: { in: userIds } },
    include: {
      userSettings: true
    }
  });

  areUsersAndIdsMatch(users, userIds);

  return users;
};

/**
 * Throws Http exception if number of users doesn't match to number of userIds
 * @param users array of User
 * @param userIds array of UserIds
 * @returns
 */
const areUsersAndIdsMatch = (users: User[], userIds: number[]) => {
  if (users.length !== userIds.length) {
    const prismaUserIds = users.map((user) => user.userId);
    const missingUserIds = userIds.filter((id) => !prismaUserIds.includes(id));
    throw new HttpException(404, `User(s) with the following ids not found: ${missingUserIds.join(', ')}`);
  }
};
