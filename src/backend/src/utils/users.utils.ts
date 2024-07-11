import { Prisma, User, User_Settings } from '@prisma/client';
import prisma from '../prisma/prisma';
import { HttpException, NotFoundException } from './errors.utils';
import { isWithinSameWeek, PermissionCheck, Role, RoleEnum } from 'shared';
import { UserWithId } from './teams.utils';
import { UserScheduleSettingsQueryArgs } from '../prisma-query-args/user.query-args';

type UserWithSettings = {
  userSettings: User_Settings | null;
} & User;

export const getUserFullName = async (userId: string | null) => {
  if (!userId) return 'no one';
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) return 'no one';
  return `${user.firstName} ${user.lastName}`;
};

export const getUserSlackId = async (userId?: string): Promise<string | undefined> => {
  if (!userId) return undefined;
  const user = await prisma.user.findUnique({ where: { userId }, include: { userSettings: true } });
  if (!user) throw new NotFoundException('User', userId);
  return user.userSettings?.slackId;
};

export const getUserRole = async (userId: string, organizationId: string): Promise<Role> => {
  const user = await prisma.user.findUnique({ where: { userId }, include: { roles: true } });
  if (!user) throw new NotFoundException('User', userId);
  return user.roles.find((role) => role.organizationId === organizationId)?.roleType ?? RoleEnum.GUEST;
};

/**
 * Produce a array of User with given userIds
 * @param userIds array of userIds as an array of integers
 * @returns array of User
 * @throws if any user does not exist
 */
export const getUsers = async (userIds: string[]): Promise<User[]> => {
  const users = await prisma.user.findMany({
    where: { userId: { in: userIds } }
  });

  validateFoundUsers(users, userIds);

  return users;
};

/**
 * Produce a array of primsa formated userIds, given the array of User
 * @param userIds the userIds to get as users
 * @returns userIds in prisma format
 */
export const getPrismaQueryUserIds = (users: UserWithId[]) => {
  const userIds = users.map((user) => {
    return {
      userId: user.userId
    };
  });
  return userIds;
};

/**
 * Gets the users for the given Ids with their user settings
 * @param userIds the userIds to get as users
 * @returns the found users with their user settings
 * @throws if any user does not exist
 */
export const getUsersWithSettings = async (userIds: string[]): Promise<UserWithSettings[]> => {
  const users = await prisma.user.findMany({
    where: { userId: { in: userIds } },
    include: {
      userSettings: true
    }
  });

  validateFoundUsers(users, userIds);

  return users;
};

/**
 * Validates that the users found in the database match the given userIds
 * @param users the users found in the database
 * @param userIds the requested usersIds to retrieve
 */
const validateFoundUsers = (users: User[], userIds: string[]) => {
  if (users.length !== userIds.length) {
    const prismaUserIds = users.map((user) => user.userId);
    const missingUserIds = userIds.filter((id) => !prismaUserIds.includes(id));
    throw new HttpException(404, `User(s) with the following ids not found: ${missingUserIds.join(', ')}`);
  }
};

export const userHasPermission = async (
  userId: string,
  organizationId: string,
  permissionCheck: PermissionCheck
): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { userId }, include: { roles: true } });
  if (!user) throw new NotFoundException('User', userId);

  const organization = await prisma.organization.findUnique({ where: { organizationId } });
  if (!organization) throw new NotFoundException('Organization', organizationId);

  return permissionCheck(user.roles.find((role) => role.organizationId === organizationId)?.roleType as Role | undefined);
};

export const areUsersinList = (users: User[], userList: User[]): boolean => {
  return users.every((user) => userList.some((u) => u.userId === user.userId));
};

export const updateUserAvailability = async (
  availability: number[],
  userSettings: Prisma.Schedule_SettingsGetPayload<UserScheduleSettingsQueryArgs>,
  submitter: User,
  dateToCheckFor: Date
) => {
  availability.forEach((time) => {
    if (time < 0 || time > 83) {
      throw new HttpException(400, 'Availability times have to be in range 0-83');
    }
  });
  const availabilityInSameWeek = userSettings.availabilities.filter((availability) =>
    isWithinSameWeek(availability.dateSet, dateToCheckFor)
  );

  if (availabilityInSameWeek.length > 0) {
    await prisma.availability.update({
      where: { availabilityId: availabilityInSameWeek[0].availabilityId },
      data: {
        availability,
        dateSet: dateToCheckFor
      }
    });
  } else {
    await prisma.availability.create({
      data: {
        availability,
        dateSet: dateToCheckFor,
        scheduleSettings: {
          connect: {
            userId: submitter.userId
          }
        }
      }
    });
  }
};
