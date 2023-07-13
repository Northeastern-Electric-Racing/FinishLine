import { Prisma } from '@prisma/client';
import { UserSettings } from 'shared';

const userSettingsTransformer = (
  UserSettings: Prisma.User_SettingsGetPayload<null>,
  userSecureSettings: Prisma.User_Secure_SettingsGetPayload<null>
): UserSettings => {
  return {
    id: UserSettings.id,
    userSecureSettingsId: userSecureSettings.userSecureSettingsId,
    defaultTheme: UserSettings.defaultTheme,
    slackId: UserSettings.slackId,
    nuid: userSecureSettings.nuid,
    street: userSecureSettings.street,
    city: userSecureSettings.city,
    state: userSecureSettings.state,
    zipcode: userSecureSettings.zipcode,
    phoneNumber: userSecureSettings.phoneNumber
  };
};

export default userSettingsTransformer;
