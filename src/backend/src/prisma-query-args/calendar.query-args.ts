import { Prisma } from '@prisma/client';

export type CalendarQueryArgs = ReturnType<typeof getCalendarQueryArgs>;

export const getCalendarQueryArgs = (_organizationId: string) =>
  Prisma.validator<Prisma.CalendarDefaultArgs>()({
    include: {
      userCreated: {
        include: {
          roles: true,
          organizations: true
        }
      },
      eventTypes: {
        include: {
          userCreated: {
            include: {
              roles: true,
              organizations: true
            }
          }
        }
      }
    }
  });
