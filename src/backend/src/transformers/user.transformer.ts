import { Prisma } from '@prisma/client';
import { RoleEnum, User, UserPreviewWithEmail, UserWithScheduleSettings } from 'shared';
import userScheduleSettingsTransformer from './user-schedule-settings.transformer.js';
import {
  UserPreviewWithEmailQueryArgs,
  UserQueryArgs,
  UserWithSettingsQueryArgs
} from '../prisma-query-args/user.query-args.js';

export const userTransformer = (user: Prisma.UserGetPayload<UserQueryArgs>): User => {
  return {
    ...user,
    role: user.roles.length > 0 ? user.roles[0].roleType : RoleEnum.GUEST
  };
};

export const userPreviewWithEmailTransformer = (
  user: Prisma.UserGetPayload<UserPreviewWithEmailQueryArgs>
): UserPreviewWithEmail => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
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
