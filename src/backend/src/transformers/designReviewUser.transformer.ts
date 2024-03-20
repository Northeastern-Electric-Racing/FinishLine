import { Prisma } from '@prisma/client';
import { UserWithScheduleSettings } from 'shared';
import userScheduleSettingsTransformer from './user-schedule-settings.transformer';

const userWithScheduleSettingsTransformer = (
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

export default userWithScheduleSettingsTransformer;
