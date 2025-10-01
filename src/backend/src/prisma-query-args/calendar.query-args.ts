import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getEventTypeQueryArgs } from './event-type.query-args';

export type CalendarQueryArgs = ReturnType<typeof getCalendarQueryArgs>;

export const getCalendarQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.CalendarDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      eventTypes: getEventTypeQueryArgs(organizationId)
    }
  });
