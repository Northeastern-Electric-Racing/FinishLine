import { BayDashboardConfig, BayDashboardCountdown } from 'shared';

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
