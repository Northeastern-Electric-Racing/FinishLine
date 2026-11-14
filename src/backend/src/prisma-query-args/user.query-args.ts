import { Prisma } from '@prisma/client';

export type UserQueryArgs = ReturnType<typeof getUserQueryArgs>;

export type BaseUserQueryArgs = ReturnType<typeof getBaseUserQueryArgs>;

export type UserPreviewWithEmailQueryArgs = ReturnType<typeof getUserPreviewWithEmailQueryArgs>;

export type UserWithSettingsQueryArgs = ReturnType<typeof getUserWithSettingsQueryArgs>;

export type UserScheduleSettingsQueryArgs = ReturnType<typeof getUserScheduleSettingsQueryArgs>;

// DO NOT CALL ANY OTHER QUERY ARGS FROM HERE TO AVOID CIRCULAR DEPENDENCIES
export const getUserQueryArgs = (organizationId?: string) =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    select: {
      roles: organizationId ? { where: { organizationId } } : true,
      userId: true,
      firstName: true,
      lastName: true,
      email: true
    }
  });

// the minimum every consumer of a user needs: who they are and what to call them
export const getBaseUserQueryArgs = () =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    select: {
      userId: true,
      firstName: true,
      lastName: true
    }
  });

export const getUserPreviewQueryArgs = () =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    select: {
      userId: true,
      firstName: true,
      lastName: true
    }
  });

export const getUserPreviewWithEmailQueryArgs = () =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    select: {
      userId: true,
      firstName: true,
      lastName: true,
      email: true
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
      drScheduleSettings: getUserScheduleSettingsQueryArgs(),
      userSettings: true,
      organizations: true
    }
  });

export const getUserScheduleSettingsQueryArgs = () => {
  return Prisma.validator<Prisma.Schedule_SettingsDefaultArgs>()({
    include: {
      availabilities: true
    }
  });
};
