import { BayDashboardConfig } from 'shared';
import { PublicBayDashboardCalendarEvent } from '../../utils/bay-dashboard-calendar.utils';

export const bayDashboardConfigTransformer = (config: BayDashboardConfig): BayDashboardConfig => {
  return {
    ...config,
    dateCreated: new Date(config.dateCreated)
  };
};

export const publicBayDashboardCalendarEventTransformer = (
  event: PublicBayDashboardCalendarEvent
): PublicBayDashboardCalendarEvent => {
  return {
    ...event,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime)
  };
};
