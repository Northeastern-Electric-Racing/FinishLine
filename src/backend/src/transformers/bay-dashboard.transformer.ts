import {
  Prisma,
  Bay_Dashboard_Widget_Size as PrismaBayDashboardWidgetSize,
  Bay_Dashboard_Widget_Type as PrismaBayDashboardWidgetType
} from '@prisma/client';
import {
  BayDashboardConfig,
  BayDashboardSlot,
  BayDashboardWidget,
  BayDashboardWidgetSize,
  BayDashboardWidgetType
} from 'shared';
import {
  BayDashboardConfigQueryArgs,
  BayDashboardSlotQueryArgs,
  BayDashboardWidgetQueryArgs
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
