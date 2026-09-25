import {
  Task as Prisma_Task,
  WBS_Element,
  Event,
  Work_Package,
  Team,
  Event_Type,
  Event_Reminder_Tier
} from '@prisma/client';
import { UserWithSettings } from './auth.utils.js';
import { formatTimeForSlack, ScheduleSlot } from 'shared';
import { HOUR_MS } from '../prisma/dates.js';
import { EventForReminder } from '../transformers/notifications.transformer.js';

export type TaskWithAssignees = Prisma_Task & {
  assignees: UserWithSettings[] | null;
  wbsElement: WBS_Element;
};

export type EventWithAttendees = Event & {
  attendees: UserWithSettings[];
  scheduledTimes: ScheduleSlot[];
  teams: Team[];
  eventType: Event_Type;
  workPackages: (Work_Package & {
    wbsElement: WBS_Element;
  })[];
};

const GRACE_MS = 2 * HOUR_MS;

const REMINDER_TIERS = [
  { tier: Event_Reminder_Tier.HOURS_48, hoursBefore: 48, label: 'in 2 days' },
  { tier: Event_Reminder_Tier.HOURS_24, hoursBefore: 24, label: 'in 1 day' },
  { tier: Event_Reminder_Tier.HOURS_1, hoursBefore: 1, label: 'within the hour' }
] as const;

export const getEventChannelIds = (event: EventForReminder): Set<string> => {
  const ids = new Set<string>();
  event.teams.forEach((t) => t.slackId && ids.add(t.slackId));
  event.workPackages.forEach((wp) => wp.project.teams.forEach((t) => t.slackId && ids.add(t.slackId)));
  return ids;
};

export const getEventAttendees = (event: EventForReminder) =>
  [...event.requiredMembers, ...event.optionalMembers, event.userCreated].filter(
    (user, i, arr) => arr.findIndex((u) => u.userId === user.userId) === i
  );

export const getDueTier = (startTime: Date, now: Date) => {
  const msUntil = startTime.getTime() - now.getTime();
  return REMINDER_TIERS.find(({ hoursBefore }) => {
    const upper = hoursBefore * HOUR_MS;
    const lower = Math.max(0, upper - GRACE_MS);
    return msUntil <= upper && msUntil > lower;
  });
};

export const buildReminderLine = (event: EventForReminder, startTime: Date, label: string): string => {
  const wpNames = event.workPackages.map((wp) => wp.wbsElement.name).join(', ');
  const unix = Math.floor(startTime.getTime() / 1000);
  const when = `<!date^${unix}^{date_short_pretty} at {time}|${formatTimeForSlack(startTime)} ET>`;
  const zoom = event.zoomLink ? `\n<${event.zoomLink}|Zoom Link>` : '';
  const doc = event.questionDocumentLink ? `\n<${event.questionDocumentLink}|Question Doc Link>` : '';

  return (
    `${usersToSlackPings(getEventAttendees(event))} *${event.eventType.name}*: ${event.title}` +
    `${wpNames ? ` (${wpNames})` : ''} is ${label}: ${when}${zoom}${doc}`
  );
};

export const usersToSlackPings = (users: UserWithSettings[]) => {
  // https://api.slack.com/reference/surfaces/formatting#mentioning-users
  return users.map(userToSlackPing).join(' ');
};

export const userToSlackPing = (user: UserWithSettings) => {
  return `<@${user.userSettings?.slackId}>`;
};

/**
 * Gets the beginning of the day tomorrow
 * @returns the beginning of the day tomorrow (at 12am)
 */
export const startOfDayTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
};

/**
 * Gets the end of the day tomorrow
 * @returns the end of the day tomorrow (i.e. 12am of the following day)
 */
export const endOfDayTomorrow = () => {
  const startOfDay = startOfDayTomorrow();
  const endOfDay = new Date(startOfDay);
  endOfDay.setUTCDate(startOfDay.getUTCDate() + 1);
  return endOfDay;
};

const EST_OFFSET_MS = 5 * 60 * 60 * 1000;

/**
 * Given a UTC Date, returns the start of that calendar day in EST (UTC-5), expressed as a UTC Date.
 * EST is always treated as UTC-5 (no DST adjustment).
 * @returns midnight EST of the given date as a UTC Date
 */
export const startOfDateEST = (date: Date): Date => {
  const dateInEST = new Date(date.getTime() - EST_OFFSET_MS);
  return new Date(Date.UTC(dateInEST.getUTCFullYear(), dateInEST.getUTCMonth(), dateInEST.getUTCDate(), 5, 0, 0, 0));
};

/**
 * Gets the start of today in EST (UTC-5), expressed as a UTC Date.
 * EST is always treated as UTC-5 (no DST adjustment).
 * @returns midnight EST today as a UTC Date
 */
export const startOfTodayEST = (): Date => startOfDateEST(new Date());

/**
 * Gets the start of tomorrow in EST (UTC-5), expressed as a UTC Date.
 * EST is always treated as UTC-5 (no DST adjustment).
 * @returns midnight EST tomorrow as a UTC Date
 */
export const startOfTomorrowEST = (): Date => {
  const start = startOfTodayEST();
  start.setUTCDate(start.getUTCDate() + 1);
  return start;
};
