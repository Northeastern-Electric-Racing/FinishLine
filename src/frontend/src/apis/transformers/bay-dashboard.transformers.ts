import { BayDashboardConfig } from 'shared';

export const bayDashboardConfigTransformer = (config: BayDashboardConfig): BayDashboardConfig => {
  return {
    ...config,
    dateCreated: new Date(config.dateCreated)
  };
};
