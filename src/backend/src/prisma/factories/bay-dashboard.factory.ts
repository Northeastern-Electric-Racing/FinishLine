import { Prisma } from '@prisma/client';
import { addDaysToDate } from 'shared';
import { subtractDaysFromDate } from '../dates.js';
import { connectOrganization, connectUser } from '../utils/common.factory.js';

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
  dateDeleted: config.deleted ? now : null,
  userDeleted: config.deleted ? connectUser(userCreatedId) : undefined,
  userCreated: connectUser(userCreatedId),
  organization: connectOrganization(organizationId)
});
