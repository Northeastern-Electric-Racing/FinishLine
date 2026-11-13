import { Prisma } from '@prisma/client';
import { getBaseUserQueryArgs } from './user.query-args.js';

export type BaseEventQueryArgs = ReturnType<typeof getBaseEventQueryArgs>;
export type CalendarEventQueryArgs = ReturnType<typeof getCalendarEventQueryArgs>;
export type EventScheduledNotificationQueryArgs = ReturnType<typeof getEventScheduledNotificationQueryArgs>;

// the minimum every consumer of an event needs: what it is, who made it, and when it happens. No dateDeleted: every query
// returning this filters deleted events out
export const getBaseEventQueryArgs = (slotWhere?: Prisma.Schedule_SlotWhereInput) =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    select: {
      eventId: true,
      title: true,
      eventTypeId: true,
      status: true,
      approved: true,
      location: true,
      zoomLink: true,
      description: true,
      questionDocumentLink: true,
      initialDateScheduled: true,
      dateCreated: true,
      notificationChannelIds: true,
      // nearly every site shows who created the event or checks it against the current user
      userCreated: getBaseUserQueryArgs(),
      // the calendar grid label and the new member widget filter; a single row of two columns
      teamType: { select: { teamTypeId: true, name: true } },
      // an event with no times is meaningless, and every site reads at least one slot. Callers that only show part of the
      // calendar narrow this to the slots they show
      scheduledTimes: {
        where: slotWhere,
        select: { scheduleSlotId: true, startTime: true, endTime: true, allDay: true },
        orderBy: { startTime: 'asc' }
      }
    }
  });

// the work package label every event view shows: "car.project.wp - name"
export const eventWorkPackageSelect = {
  select: {
    workPackageId: true,
    wbsElement: { select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true } }
  }
} satisfies Prisma.Event$workPackagesArgs;

// the calendar grid and the Your Events / Review Bookings tables: everything they render without opening the event
export const getCalendarEventQueryArgs = (slotWhere?: Prisma.Schedule_SlotWhereInput) =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    select: {
      ...getBaseEventQueryArgs(slotWhere).select,
      approvalRequiredBy: getBaseUserQueryArgs(),
      // the "+N" overflow card names one required member per event
      requiredMembers: { take: 1, ...getBaseUserQueryArgs() },
      _count: { select: { requiredMembers: true, optionalMembers: true, deniedMembers: true, scheduledTimes: true } }
    }
  });

// what every event validation read selects on top of the columns it checks: enough to reject deleted events and events
// outside the organization (see assertEventInOrganization)
export const eventValidationSelect = {
  dateDeleted: true,
  eventType: { select: { organizationId: true } }
} satisfies Prisma.EventSelect;

// the event as the "has been scheduled / rescheduled" slack notification describes it, plus the threads it posts to.
// Read back after editing a slot and after scheduling an event
export const getEventScheduledNotificationQueryArgs = () =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    select: {
      ...getBaseEventQueryArgs().select,
      notificationSlackThreads: true,
      requiredMembers: { select: { userId: true } },
      optionalMembers: { select: { userId: true } },
      workPackages: { select: { wbsElement: { select: { name: true } } } }
    }
  });
