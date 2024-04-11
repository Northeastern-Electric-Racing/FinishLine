import { Prisma } from '@prisma/client';
import { User, UserWithScheduleSettings } from 'shared';
import userScheduleSettingsTransformer from './user-schedule-settings.transformer';

export const userTransformer = (user: Prisma.UserGetPayload<null>): User => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailId: user.emailId,
    role: user.role
  };
};

export const userWithScheduleSettingsTransformer = (
  user: Prisma.UserGetPayload<{ include: { drScheduleSettings: true } }>
): UserWithScheduleSettings => {
  return {
    userId: user.userId,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    emailId: user.emailId,
    role: user.role,
    scheduleSettings: user.drScheduleSettings ? userScheduleSettingsTransformer(user.drScheduleSettings) : undefined
  };
};
