import { Prisma } from '@prisma/client';
import { Permission, RoleEnum, User, UserWithScheduleSettings } from 'shared';
import userScheduleSettingsTransformer from './user-schedule-settings.transformer';
import { UserQueryArgs, UserWithSettingsQueryArgs } from '../prisma-query-args/user.query-args';

export const userTransformer = (user: Prisma.UserGetPayload<UserQueryArgs>): User => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailId: user.emailId,
    role: user.roles.length > 0 ? user.roles[0].roleType : RoleEnum.GUEST,
    permissions: user.permissions.map((permission) => permission as Permission)
  };
};

export const userWithScheduleSettingsTransformer = (
  user: Prisma.UserGetPayload<UserWithSettingsQueryArgs>
): UserWithScheduleSettings => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailId: user.emailId,
    role: user.roles.length > 0 ? user.roles[0].roleType : RoleEnum.GUEST,
    scheduleSettings: user.drScheduleSettings ? userScheduleSettingsTransformer(user.drScheduleSettings) : undefined
  };
};
