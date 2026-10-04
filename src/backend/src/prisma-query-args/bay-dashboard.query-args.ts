import { Prisma } from '@prisma/client';

export type BayDashboardConfigQueryArgs = ReturnType<typeof getBayDashboardConfigQueryArgs>;

export const getBayDashboardConfigQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_ConfigDefaultArgs>()({
    include: {
      slots: {
        orderBy: { position: 'asc' },
        include: {
          widgets: { orderBy: { order: 'asc' } }
        }
      }
    }
  });
