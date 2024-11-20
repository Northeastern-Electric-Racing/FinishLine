import { Prisma } from '@prisma/client';
import { getPermissionsForRoleType, Permission, RoleEnum, User, UserWithScheduleSettings } from 'shared';
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
    permissions: user.roles
      .map((role) => getPermissionsForRoleType(role.roleType))
      .flat()
      .concat(user.additionalPermissions as Permission[])
  };
};

export const userWithScheduleSettingsTransformer = (
  user: Prisma.UserGetPayload<UserWithSettingsQueryArgs>
): UserWithScheduleSettings => {
  return {
    ...userTransformer(user),
    scheduleSettings: user.drScheduleSettings ? userScheduleSettingsTransformer(user.drScheduleSettings) : undefined
  };
};
