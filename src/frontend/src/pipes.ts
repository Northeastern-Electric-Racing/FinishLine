/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber, User } from 'shared';

/**
 * Pipes:
 *
 * Data transformation functions designed to abstract view-based adjustments.
 * Only string-based stuff basically.
 * Pipe is a term / tool from Angular.
 */

/** Display number as "4 weeks" or "1 week" */
export const weeksPipe = (weeks: number) => {
  return `${weeks} week${weeks === 1 ? '' : 's'}`;
};

/** Display number as "$535" */
export const dollarsPipe = (dollars: number) => {
  return `$${dollars}`;
};

/** Display WBS number as string "1.2.0" */
export const wbsPipe = (wbsNum: WbsNumber) => {
  return `${wbsNum.carNumber}.${wbsNum.projectNumber}.${wbsNum.workPackageNumber}`;
};

/** Display user by their name "Joe Shmoe" */
export const fullNamePipe = (user?: User) => {
  return user ? `${user.firstName} ${user.lastName}` : emDashPipe('');
};

/** Display boolean as "YES" or "NO" */
export const booleanPipe = (bool: boolean) => {
  return bool ? 'YES' : 'NO';
};

/** Formats an array of objects into a string that is a list. */
export const listPipe = <T>(array: T[], transform: (ele: T) => string) => {
  return array.map(transform).join(', ');
};

/** Formats the end date as a string. */
export const endDatePipe = (startDate: Date, durWeeks: number) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durWeeks * 7);
  return datePipe(endDate);
};

/** Replaces an empty string with an EM dash. */
export const emDashPipe = (str: string) => {
  return str.trim() === '' ? '—' : str;
};

/**
 * Return a given date as a string in the local en-US format,
 * with single digit numbers starting with a zero.
 */
export const datePipe = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  });
};

/** returns a given number as a string with a percent sign */
export const percentPipe = (percent: number) => {
  return `${percent}%`;
};
