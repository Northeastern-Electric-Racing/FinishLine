import {
  Prisma,
  Bay_Dashboard_Widget_Size as PrismaBayDashboardWidgetSize,
  Bay_Dashboard_Widget_Type as PrismaBayDashboardWidgetType
} from '@prisma/client';
import {
  BayDashboardConfig,
  BayDashboardCountdown,
  BayDashboardSlot,
  BayDashboardWidget,
  BayDashboardWidgetSize,
  BayDashboardWidgetType,
  daysBetween,
  PublicBayDashboardCalendarEvent,
  PublicBayDashboardConfig,
  PublicBayDashboardOverdueWorkPackage
} from 'shared';
import {
  BayDashboardCalendarEventQueryArgs,
  BayDashboardConfigQueryArgs,
  BayDashboardCountdownQueryArgs,
  BayDashboardOverdueWorkPackageQueryArgs,
  BayDashboardSlotQueryArgs,
  BayDashboardWidgetQueryArgs,
  PublicBayDashboardConfigQueryArgs
} from '../prisma-query-args/bay-dashboard.query-args.js';

export const bayDashboardWidgetSizeTransformer = (size: PrismaBayDashboardWidgetSize): BayDashboardWidgetSize => {
  const mapping: Record<PrismaBayDashboardWidgetSize, BayDashboardWidgetSize> = {
    SMALL: BayDashboardWidgetSize.SMALL,
    MEDIUM: BayDashboardWidgetSize.MEDIUM,
    LARGE: BayDashboardWidgetSize.LARGE
  };
  return mapping[size];
};

export const bayDashboardWidgetTypeTransformer = (type: PrismaBayDashboardWidgetType): BayDashboardWidgetType => {
  const mapping: Record<PrismaBayDashboardWidgetType, BayDashboardWidgetType> = {
    CALENDAR: BayDashboardWidgetType.CALENDAR,
    OVERDUE_WORK_PACKAGES: BayDashboardWidgetType.OVERDUE_WORK_PACKAGES,
    TEXT_FIELD: BayDashboardWidgetType.TEXT_FIELD,
    TIER_LIST: BayDashboardWidgetType.TIER_LIST,
    MBTA_TRACKER: BayDashboardWidgetType.MBTA_TRACKER,
    SLACK_APPRECIATIONS: BayDashboardWidgetType.SLACK_APPRECIATIONS,
    SLACK_MENTIONS: BayDashboardWidgetType.SLACK_MENTIONS
  };
  return mapping[type];
};

export const bayDashboardWidgetTransformer = (
  widget: Prisma.Bay_Dashboard_WidgetGetPayload<BayDashboardWidgetQueryArgs>
): BayDashboardWidget => {
  return {
    bayDashboardWidgetId: widget.bayDashboardWidgetId,
    type: bayDashboardWidgetTypeTransformer(widget.type),
    order: widget.order,
    text: widget.text ?? undefined
  };
};

export const bayDashboardSlotTransformer = (
  slot: Prisma.Bay_Dashboard_SlotGetPayload<BayDashboardSlotQueryArgs>
): BayDashboardSlot => {
  return {
    bayDashboardSlotId: slot.bayDashboardSlotId,
    size: bayDashboardWidgetSizeTransformer(slot.size),
    position: slot.position,
    rotationSeconds: slot.rotationSeconds,
    widgets: slot.widgets.map(bayDashboardWidgetTransformer)
  };
};

export const bayDashboardConfigTransformer = (
  config: Prisma.Bay_Dashboard_ConfigGetPayload<BayDashboardConfigQueryArgs>
): BayDashboardConfig => {
  return {
    bayDashboardConfigId: config.bayDashboardConfigId,
    dateCreated: config.dateCreated,
    slots: config.slots.map(bayDashboardSlotTransformer)
  };
};

export const publicBayDashboardConfigTransformer = (
  config: Prisma.Bay_Dashboard_ConfigGetPayload<PublicBayDashboardConfigQueryArgs>
): PublicBayDashboardConfig => {
  return {
    slots: config.slots.map((slot) => ({
      size: bayDashboardWidgetSizeTransformer(slot.size),
      position: slot.position,
      rotationSeconds: slot.rotationSeconds,
      widgets: slot.widgets.map((widget) => ({
        type: bayDashboardWidgetTypeTransformer(widget.type),
        order: widget.order,
        text: widget.text ?? undefined
      }))
    }))
  };
};

export const bayDashboardCountdownTransformer = (
  countdown: Prisma.Bay_Dashboard_CountdownGetPayload<BayDashboardCountdownQueryArgs>
): BayDashboardCountdown => {
  return {
    bayDashboardCountdownId: countdown.bayDashboardCountdownId,
    name: countdown.name,
    startDate: countdown.startDate,
    endDate: countdown.endDate ?? undefined,
    isPrimary: countdown.isPrimary
  };
};

/**
 * Turns an event into one public calendar event per schedule slot.
 */
export const publicBayDashboardCalendarEventsTransformer = (
  event: Prisma.EventGetPayload<BayDashboardCalendarEventQueryArgs>
): PublicBayDashboardCalendarEvent[] => {
  const [calendar] = event.eventType.calendars;
  if (!calendar) return [];

  return event.scheduledTimes.map((slot) => ({
    title: event.title,
    startTime: slot.startTime,
    endTime: slot.endTime,
    allDay: slot.allDay,
    location: event.location ?? undefined,
    colorHexCode: calendar.colorHexCode
  }));
};

/**
 * Transforms an overdue work package into what the public TV's overdue widget displays.
 * @param workPackage the work package, with its blockers that are not deleted
 * @param endDate the work package's end date, calculated by the caller
 * @param now the time the overdue calculation is made against
 */
export const publicBayDashboardOverdueWorkPackageTransformer = (
  workPackage: Prisma.Work_PackageGetPayload<BayDashboardOverdueWorkPackageQueryArgs>,
  endDate: Date,
  now: Date
): PublicBayDashboardOverdueWorkPackage => {
  const { wbsElement, project } = workPackage;

  return {
    wbsNum: {
      carNumber: wbsElement.carNumber,
      projectNumber: wbsElement.projectNumber,
      workPackageNumber: wbsElement.workPackageNumber
    },
    name: wbsElement.name,
    projectWbsNum: {
      carNumber: project.wbsElement.carNumber,
      projectNumber: project.wbsElement.projectNumber,
      workPackageNumber: 0
    },
    projectName: project.wbsElement.name,
    lead: wbsElement.lead ?? undefined,
    manager: wbsElement.manager ?? undefined,
    endDate,
    daysOverdue: daysBetween(now, endDate),
    blockedBy: workPackage.blockedBy.map((blocker) => ({
      wbsNum: {
        carNumber: blocker.carNumber,
        projectNumber: blocker.projectNumber,
        workPackageNumber: blocker.workPackageNumber
      },
      name: blocker.name
    }))
  };
};
