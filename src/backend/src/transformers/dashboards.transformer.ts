import { Prisma } from '@prisma/client';
import { DashboardQueryArgs } from '../prisma-query-args/dashboards.query-args.js';
import { Dashboard } from 'shared';

const dashboardTransformer = (dashboard: Prisma.DashboardGetPayload<DashboardQueryArgs>): Dashboard => {
  return {
    dashboardId: dashboard.dashboardId,
    name: dashboard.name,
    link: dashboard.link,
    dateCreated: dashboard.dateCreated
  };
};

export default dashboardTransformer;
