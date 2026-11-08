import { Bay_Dashboard_Widget_Size, Bay_Dashboard_Widget_Type, Prisma } from '@prisma/client';
import { addDaysToDate } from 'shared';
import { subtractDaysFromDate } from '../dates.js';
import { connectOrganization, connectUser } from '../utils/common.factory.js';

type SlotConfig = {
  position: number;
  size: Bay_Dashboard_Widget_Size;
  widgetType: Bay_Dashboard_Widget_Type;
  text?: string;
};

// position 0 left large Calendar, 1 right medium Overdue WP, 2 right small Text Field
export const slotConfigs: SlotConfig[] = [
  { position: 0, size: Bay_Dashboard_Widget_Size.LARGE, widgetType: Bay_Dashboard_Widget_Type.CALENDAR },
  { position: 1, size: Bay_Dashboard_Widget_Size.MEDIUM, widgetType: Bay_Dashboard_Widget_Type.OVERDUE_WORK_PACKAGES },
  {
    position: 2,
    size: Bay_Dashboard_Widget_Size.SMALL,
    widgetType: Bay_Dashboard_Widget_Type.TEXT_FIELD,
    text: 'Fill out the census for Spring 2026!'
  }
];

// the config the current one replaced
export const previousSlotConfigs: SlotConfig[] = [
  { position: 0, size: Bay_Dashboard_Widget_Size.LARGE, widgetType: Bay_Dashboard_Widget_Type.OVERDUE_WORK_PACKAGES },
  { position: 1, size: Bay_Dashboard_Widget_Size.MEDIUM, widgetType: Bay_Dashboard_Widget_Type.CALENDAR },
  {
    position: 2,
    size: Bay_Dashboard_Widget_Size.SMALL,
    widgetType: Bay_Dashboard_Widget_Type.TEXT_FIELD,
    text: 'Welcome back to the bay!'
  }
];

export const bayDashboardConfigCreateInput = (
  userCreatedId: string,
  organizationId: string,
  slots: SlotConfig[],
  dateCreated?: Date,
  dateDeleted?: Date
): Prisma.Bay_Dashboard_ConfigCreateInput => ({
  dateCreated,
  dateDeleted,
  userCreated: connectUser(userCreatedId),
  organization: connectOrganization(organizationId),
  slots: {
    create: slots.map((slot) => ({
      position: slot.position,
      size: slot.size,
      widgets: { create: [{ type: slot.widgetType, order: 0, text: slot.text }] }
    }))
  }
});

type CountdownConfig = {
  name: string;
  startDaysAgo: number;
  endDaysFromNow: number | null;
  isPrimary: boolean;
  deleted: boolean;
};

export const countdownConfigs: CountdownConfig[] = [
  { name: 'FHE', startDaysAgo: 120, endDaysFromNow: 45, isPrimary: true, deleted: false },
  { name: 'FSAE', startDaysAgo: 90, endDaysFromNow: 180, isPrimary: false, deleted: false },
  { name: 'Days Since Bay Cleaned', startDaysAgo: 12, endDaysFromNow: null, isPrimary: false, deleted: false },
  { name: 'Old Competition', startDaysAgo: 400, endDaysFromNow: -300, isPrimary: false, deleted: true }
];

export const bayDashboardCountdownCreateInput = (
  userCreatedId: string,
  organizationId: string,
  config: CountdownConfig,
  now: Date
): Prisma.Bay_Dashboard_CountdownCreateInput => ({
  name: config.name,
  startDate: subtractDaysFromDate(now, config.startDaysAgo),
  endDate: config.endDaysFromNow === null ? null : addDaysToDate(now, config.endDaysFromNow),
  isPrimary: config.isPrimary,
  dateCreated: config.deleted ? subtractDaysFromDate(now, 30) : undefined,
  dateDeleted: config.deleted ? now : null,
  userDeleted: config.deleted ? connectUser(userCreatedId) : undefined,
  userCreated: connectUser(userCreatedId),
  organization: connectOrganization(organizationId)
});
