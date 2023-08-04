import { Prisma } from '@prisma/client';
import { UserSecureSettings } from 'shared';

const userSecureSettingsTransformer = (settings: Prisma.User_Secure_SettingsGetPayload<null>): UserSecureSettings => {
  return {
    userSecureSettingsId: settings.userSecureSettingsId,
    nuid: settings.nuid,
    street: settings.street,
    city: settings.city,
    state: settings.state,
    zipcode: settings.zipcode,
    phoneNumber: settings.phoneNumber
  };
};

export default userSecureSettingsTransformer;
