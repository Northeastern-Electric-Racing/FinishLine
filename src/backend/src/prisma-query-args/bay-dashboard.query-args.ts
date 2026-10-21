import { Prisma } from '@prisma/client';

export type BayDashboardWidgetQueryArgs = ReturnType<typeof getBayDashboardWidgetQueryArgs>;

export type BayDashboardSlotQueryArgs = ReturnType<typeof getBayDashboardSlotQueryArgs>;

export type BayDashboardConfigQueryArgs = ReturnType<typeof getBayDashboardConfigQueryArgs>;

export type PublicBayDashboardConfigQueryArgs = ReturnType<typeof getPublicBayDashboardConfigQueryArgs>;

export type BayDashboardCountdownQueryArgs = ReturnType<typeof getBayDashboardCountdownQueryArgs>;

export const getBayDashboardWidgetQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_WidgetDefaultArgs>()({
    select: {
      bayDashboardWidgetId: true,
      type: true,
      order: true,
      text: true
    }
  });

export const getBayDashboardSlotQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_SlotDefaultArgs>()({
    select: {
      bayDashboardSlotId: true,
      size: true,
      position: true,
      rotationSeconds: true,
      widgets: { orderBy: { order: 'asc' }, ...getBayDashboardWidgetQueryArgs() }
    }
  });

export const getBayDashboardConfigQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_ConfigDefaultArgs>()({
    select: {
      bayDashboardConfigId: true,
      dateCreated: true,
      slots: { orderBy: { position: 'asc' }, ...getBayDashboardSlotQueryArgs() }
    }
  });

/**
 * Selects only what the unauthenticated TV needs to render
 */
export const getPublicBayDashboardConfigQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_ConfigDefaultArgs>()({
    select: {
      slots: {
        orderBy: { position: 'asc' },
        select: {
          size: true,
          position: true,
          rotationSeconds: true,
          widgets: { orderBy: { order: 'asc' }, select: { type: true, order: true, text: true } }
        }
      }
    }
  });

export const getBayDashboardCountdownQueryArgs = () =>
  Prisma.validator<Prisma.Bay_Dashboard_CountdownDefaultArgs>()({
    select: {
      bayDashboardCountdownId: true,
      name: true,
      startDate: true,
      endDate: true
    }
  });
