import { Prisma } from '@prisma/client';
import { RoleEnum, User, UserPreview, UserWithScheduleSettings } from 'shared';
import userScheduleSettingsTransformer from './user-schedule-settings.transformer.js';
import { getUserPreviewQueryArgs, UserQueryArgs, UserWithSettingsQueryArgs } from '../prisma-query-args/user.query-args.js';

type UserPreviewPayload = Prisma.UserGetPayload<ReturnType<typeof getUserPreviewQueryArgs>>;

export const userPreviewTransformer = (user: UserPreviewPayload): UserPreview => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName
  };
};

export const userTransformer = (user: Prisma.UserGetPayload<UserQueryArgs>): User => {
  return {
    ...user,
    role: user.roles.length > 0 ? user.roles[0].roleType : RoleEnum.GUEST
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
