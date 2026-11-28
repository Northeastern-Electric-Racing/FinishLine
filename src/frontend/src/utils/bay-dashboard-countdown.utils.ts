/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import dayjs from 'dayjs';
import { BayDashboardCountdown, dateToMidnightUTC, formatDateOnly } from 'shared';

export interface CountdownDisplay {
  days: number;
  label: string;
  // how much of the gauge is filled, from 0 to 1
  progress: number;
}

/**
 * Whole calendar days from one date to another. Countdown dates are stored as the UTC day picked in the
 * Admin Tools (the same day formatDateOnly shows in the table), so they're compared as days, not timestamps.
 */
const daysBetween = (from: Date, to: Date): number =>
  dayjs(formatDateOnly(to, 'YYYY-MM-DD')).diff(dayjs(formatDateOnly(from, 'YYYY-MM-DD')), 'day');

/**
 * Builds the label under the number, leaving names like "Days Since Last Bay Clean Up" as they are
 */
const countdownLabel = (direction: 'Until' | 'Since', days: number, name: string): string => {
  if (/^days? (until|since)\b/i.test(name)) return name;
  return `${days === 1 ? 'Day' : 'Days'} ${direction} ${name}`;
};

/**
 * What a countdown shows on a given day. Counts down to the end date, then switches to counting
 * the days since it. A countdown with no end date counts up from its start date.
 * @param countdown the countdown to display
 * @param now the current time, today in the TV's timezone is the day used
 */
export const getCountdownDisplay = (countdown: BayDashboardCountdown, now: Date): CountdownDisplay => {
  const today = dateToMidnightUTC(now);
  const { name, startDate, endDate } = countdown;

  if (endDate && daysBetween(today, endDate) > 0) {
    const days = daysBetween(today, endDate);
    const totalDays = daysBetween(startDate, endDate);
    const elapsedDays = daysBetween(startDate, today);
    const progress = totalDays > 0 ? Math.min(Math.max(elapsedDays / totalDays, 0), 1) : 1;
    return { days, label: countdownLabel('Until', days, name), progress };
  }

  // a count up that hasn't started yet counts down to its start instead of showing negative days
  if (!endDate && daysBetween(today, startDate) > 0) {
    const days = daysBetween(today, startDate);
    return { days, label: countdownLabel('Until', days, name), progress: 0 };
  }

  const days = daysBetween(endDate ?? startDate, today);
  return { days, label: countdownLabel('Since', days, name), progress: 1 };
};

/**
 * Splits countdowns into the one shown in the large gauge and the one shown in the corner badge.
 * The gauge shows the primary countdown. The badge shows the remaining countdown ending soonest,
 * with countdowns that have no end date or have already ended after those still counting down.
 * If no countdown is primary, the first countdown in that order takes the gauge.
 */
export const pickDisplayedCountdowns = (
  countdowns: BayDashboardCountdown[],
  now: Date
): { primary?: BayDashboardCountdown; secondary?: BayDashboardCountdown } => {
  const today = dateToMidnightUTC(now);
  const upcomingEnd = (countdown: BayDashboardCountdown): number =>
    countdown.endDate && daysBetween(today, countdown.endDate) > 0 ? countdown.endDate.getTime() : Infinity;

  // compared rather than subtracted, Infinity - Infinity is NaN
  const sorted = [...countdowns].sort((a, b) => {
    const aEnd = upcomingEnd(a);
    const bEnd = upcomingEnd(b);
    if (aEnd === bEnd) return 0;
    return aEnd < bEnd ? -1 : 1;
  });
  const primary = sorted.find((countdown) => countdown.isPrimary) ?? sorted[0];
  const secondary = sorted.find((countdown) => countdown !== primary);

  return { primary, secondary };
};
