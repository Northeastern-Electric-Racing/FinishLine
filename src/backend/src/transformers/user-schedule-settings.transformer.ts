import { Prisma } from '@prisma/client';
import { UserScheduleSettings } from 'shared';
import { UserScheduleSettingsQueryArgs } from '../prisma-query-args/user.query-args';

const userScheduleSettingsTransformer = (
  settings: Prisma.Schedule_SettingsGetPayload<UserScheduleSettingsQueryArgs>
): UserScheduleSettings => {
  return {
    drScheduleSettingsId: settings.drScheduleSettingsId,
    personalGmail: settings.personalGmail,
    personalZoomLink: settings.personalZoomLink,
    availabilities: settings.availabilities
  };
};

export default userScheduleSettingsTransformer;
