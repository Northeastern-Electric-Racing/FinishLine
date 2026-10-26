import { datesEqual } from './date-utils.js';
/**
 * Determines if the two dates are in bufferDays distance from each other
 *
 * @param scheduledDate Current date scheduled.
 * @param newDate New date scheduled for a later date from the scheduledDate.
 * @param bufferDays The number of days apart the two days can be
 */
export const isWithinBuffer = (scheduledDate: Date, newDate: Date, bufferDays: number) => {
  const UTCScheduledDate = Date.UTC(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
  const UTCNewDate = Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());

  const millisecondDifference = UTCNewDate - UTCScheduledDate;
  const dayDifference = Math.floor(Math.abs(millisecondDifference / (1000 * 3600 * 24)));
  return bufferDays >= dayDifference;
};

/**
 * Whether a project edit changes a field that requires a change request. Budget and
 * description bullets are meaningful; name, summary, links, lead and manager are not.
 * All bullet types count, since they're per-organization names rather than a fixed set.
 */
export const projectEditNeedsCR = (
  originalBudget: number,
  newBudget: number,
  originalBullets: { id: string; detail: string }[],
  newBullets: { id: string; detail: string }[]
): boolean => {
  if (originalBudget !== newBudget) return true;
  return bulletsChanged(originalBullets, newBullets);
};

/**
 * Whether a work package edit changes a field that requires a change request. Start date,
 * duration and description bullets are meaningful; name, stage, blocked by, lead and
 * manager are not.
 */
export const workPackageEditNeedsCR = (
  originalStartDate: Date,
  newStartDate: Date,
  originalDuration: number,
  newDuration: number,
  originalBullets: { id: string; detail: string }[],
  newBullets: { id: string; detail: string }[]
): boolean => {
  if (!datesEqual(originalStartDate, newStartDate)) return true;
  if (originalDuration !== newDuration) return true;
  return bulletsChanged(originalBullets, newBullets);
};

const bulletsChanged = (original: { id: string; detail: string }[], updated: { id: string; detail: string }[]): boolean => {
  if (original.length !== updated.length) return true;
  const originalById = new Map(original.map((b) => [b.id, b.detail]));
  return updated.some((b) => originalById.get(b.id) !== b.detail);
};
