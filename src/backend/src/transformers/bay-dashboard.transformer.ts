import { Prisma } from '@prisma/client';
import { BayDashboardConfig, BayDashboardWidgetSize, BayDashboardWidgetType } from 'shared';
import { BayDashboardConfigQueryArgs } from '../prisma-query-args/bay-dashboard.query-args.js';

export const bayDashboardConfigTransformer = (
  config: Prisma.Bay_Dashboard_ConfigGetPayload<BayDashboardConfigQueryArgs>
): BayDashboardConfig => {
  return {
    bayDashboardConfigId: config.bayDashboardConfigId,
    dateCreated: config.dateCreated,
    slots: config.slots.map((slot) => ({
      bayDashboardSlotId: slot.bayDashboardSlotId,
      size: slot.size as BayDashboardWidgetSize,
      position: slot.position,
      rotationSeconds: slot.rotationSeconds,
      widgets: slot.widgets.map((widget) => ({
        bayDashboardWidgetId: widget.bayDashboardWidgetId,
        type: widget.type as BayDashboardWidgetType,
        order: widget.order,
        text: widget.text ?? undefined
      }))
    }))
  };
};
