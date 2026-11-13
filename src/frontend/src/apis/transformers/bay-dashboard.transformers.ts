import {
  BayDashboardConfig,
  BayDashboardCountdown,
  PublicBayDashboardCalendarEvent,
  PublicBayDashboardOverdueWorkPackage
} from 'shared';

export const bayDashboardConfigTransformer = (config: BayDashboardConfig): BayDashboardConfig => {
  return {
    ...config,
    dateCreated: new Date(config.dateCreated)
  };
};

export const bayDashboardCountdownTransformer = (countdown: BayDashboardCountdown): BayDashboardCountdown => {
  return {
    ...countdown,
    startDate: new Date(countdown.startDate),
    endDate: countdown.endDate ? new Date(countdown.endDate) : undefined
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

export const publicBayDashboardOverdueWorkPackageTransformer = (
  workPackage: PublicBayDashboardOverdueWorkPackage
): PublicBayDashboardOverdueWorkPackage => {
  return {
    ...workPackage,
    endDate: new Date(workPackage.endDate)
  };
};
