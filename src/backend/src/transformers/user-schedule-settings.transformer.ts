import { Prisma } from '@prisma/client';
import { userScheduleSettings } from 'shared';

const userScheduleSettingsTransformer = (settings: Prisma.Schedule_SettingsGetPayload<null>): userScheduleSettings => {
  return {
    drScheduleSettingsId: settings.drScheduleSettingsId,
    personalGmail: settings.personalGmail,
    personalZoomLink: settings.personalZoomLink,
    availability: settings.availability,
    userId: settings.userId
  };
};

export default userScheduleSettingsTransformer;
