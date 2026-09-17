import { Prisma } from '@prisma/client';
import { buildScheduledTimesOverlap } from '../../utils/calendar.utils.js';

export type McpEventQueryArgs = ReturnType<typeof getMcpEventQueryArgs>;

/**
 * @param startDate the start of the requested range
 * @param endDate the end of the requested range
 */
export const getMcpEventQueryArgs = (startDate: Date, endDate: Date) =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    select: {
      eventId: true,
      title: true,
      description: true,
      location: true,
      zoomLink: true,
      status: true,
      // a recurring event can have many slots, so only return the ones inside the requested range.
      // reusing the same overlap filter as the outer query keeps the two definitions consistent.
      scheduledTimes: {
        where: buildScheduledTimesOverlap(startDate, endDate)?.some,
        select: { startTime: true, endTime: true, allDay: true },
        orderBy: { startTime: 'asc' as const }
      },
      // counted separately and unfiltered, so that an event stays marked recurring even when only
      // one of its occurrences falls inside the range
      _count: { select: { scheduledTimes: true } },
      teams: { where: { dateArchived: null }, select: { teamName: true } },
      // an event reaches its calendars indirectly through its event type, which is many to many,
      // so an event can legitimately appear on more than one calendar
      eventType: {
        select: {
          name: true,
          calendars: { where: { dateDeleted: null }, select: { name: true } }
        }
      }
    }
  });
