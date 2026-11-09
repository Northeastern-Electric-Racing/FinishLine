import { Prisma, WBS_Element_Status } from '@prisma/client';
import { getBaseWorkPackageQueryArgs } from './work-packages.query-args.js';

export type BayDashboardWidgetQueryArgs = ReturnType<typeof getBayDashboardWidgetQueryArgs>;

export type BayDashboardSlotQueryArgs = ReturnType<typeof getBayDashboardSlotQueryArgs>;

export type BayDashboardConfigQueryArgs = ReturnType<typeof getBayDashboardConfigQueryArgs>;

export type PublicBayDashboardConfigQueryArgs = ReturnType<typeof getPublicBayDashboardConfigQueryArgs>;

export type BayDashboardCountdownQueryArgs = ReturnType<typeof getBayDashboardCountdownQueryArgs>;

export type BayDashboardCalendarEventQueryArgs = ReturnType<typeof getBayDashboardCalendarEventQueryArgs>;

export type BayDashboardOverdueWorkPackageQueryArgs = ReturnType<typeof getBayDashboardOverdueWorkPackageQueryArgs>;

export const getBayDashboardWidgetQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_WidgetDefaultArgs>()({
    select: {
      bayDashboardWidgetId: true,
      type: true,
      order: true,
      text: true
    }
  });

export const getBayDashboardSlotQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_SlotDefaultArgs>()({
    select: {
      bayDashboardSlotId: true,
      size: true,
      position: true,
      rotationSeconds: true,
      widgets: { orderBy: { order: 'asc' }, ...getBayDashboardWidgetQueryArgs() }
    }
  });

export const getBayDashboardConfigQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_ConfigDefaultArgs>()({
    select: {
      bayDashboardConfigId: true,
      dateCreated: true,
      slots: { orderBy: { position: 'asc' }, ...getBayDashboardSlotQueryArgs() }
    }
  });

/**
 * Selects only what the unauthenticated TV needs to render
 */
export const getPublicBayDashboardConfigQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_ConfigDefaultArgs>()({
    select: {
      slots: {
        orderBy: { position: 'asc' },
        select: {
          size: true,
          position: true,
          rotationSeconds: true,
          widgets: { orderBy: { order: 'asc' }, select: { type: true, order: true, text: true } }
        }
      }
    }
  });

export const getBayDashboardCountdownQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_CountdownDefaultArgs>()({
    select: {
      bayDashboardCountdownId: true,
      name: true,
      startDate: true,
      endDate: true,
      isPrimary: true
    }
  });

/**
 * Only calendar information that the public TV shows.
 * @param scheduledTimeFilter limits the schedule slots that are loaded
 */
export const getBayDashboardCalendarEventQueryArgs = (scheduledTimeFilter: Prisma.Schedule_SlotWhereInput) =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    select: {
      title: true,
      location: true,
      scheduledTimes: {
        where: scheduledTimeFilter,
        select: { startTime: true, endTime: true, allDay: true }
      },
      eventType: {
        select: {
          calendars: {
            where: { dateDeleted: null },
            orderBy: { dateCreated: 'asc' },
            take: 1,
            select: { colorHexCode: true }
          }
        }
      }
    }
  });

/**
 * Only the work package information the public TV's overdue widget shows.
 */
export const getBayDashboardOverdueWorkPackageQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      ...getBaseWorkPackageQueryArgs().select,
      blockedBy: {
        where: { dateDeleted: null, status: { not: WBS_Element_Status.COMPLETE } },
        select: { carNumber: true, projectNumber: true, workPackageNumber: true, name: true }
      }
    }
  });
