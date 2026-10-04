import { Prisma } from '@prisma/client';
import { BayDashboardConfig } from 'shared';
import { BayDashboardConfigQueryArgs } from '../prisma-query-args/bay-dashboard.query-args.js';

const bayDashboardConfigTransformer = (
  config: Prisma.Bay_Dashboard_ConfigGetPayload<BayDashboardConfigQueryArgs>
): BayDashboardConfig => {
  return {
    bayDashboardConfigId: config.bayDashboardConfigId,
    dateCreated: config.dateCreated,
    dateDeleted: config.dateDeleted ?? undefined,
    userCreatedId: config.userCreatedId,
    slots: config.slots.map((slot) => ({
      bayDashboardSlotId: slot.bayDashboardSlotId,
      position: slot.position,
      size: slot.size,
      rotationSeconds: slot.rotationSeconds,
      widgets: slot.widgets.map((widget) => ({
        bayDashboardWidgetId: widget.bayDashboardWidgetId,
        type: widget.type,
        order: widget.order,
        text: widget.text ?? undefined
      }))
    }))
  };
};

export default bayDashboardConfigTransformer;
