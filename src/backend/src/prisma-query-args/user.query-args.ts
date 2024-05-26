import { Prisma } from '@prisma/client';

export type UserQueryArgs = ReturnType<typeof getUserQueryArgs>;

export type UserWithSettingsQueryArgs = ReturnType<typeof getUserWithSettingsQueryArgs>;

// DO NOT CALL ANY OTHER QUERY ARGS FROM HERE TO AVOID CIRCULAR DEPENDENCIES
export const getUserQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
      roles: {
        where: {
          organizationId
        }
      },
      organizations: true
    }
  });

export const getUserWithSettingsQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    include: {
      roles: {
        where: {
          organizationId
        }
      },
      drScheduleSettings: true,
      userSettings: true,
      organizations: true
    }
  });
