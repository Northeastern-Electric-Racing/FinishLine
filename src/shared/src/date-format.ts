/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Format a date-only value (deadlines, start dates stored as @db.Date).
 * Uses UTC because @db.Date columns return midnight UTC, and we want the UTC date (which IS the stored date).
 */
export const formatDateOnly = (date: Date, format = 'MM/DD/YYYY'): string => dayjs.utc(date).format(format);

/**
 * Format a full timestamp in the user's local timezone or a specified timezone.
 */
export const formatTimestamp = (date: Date, tz?: string): string =>
  tz ? dayjs(date).tz(tz).format('MM/DD/YYYY h:mm A') : dayjs(date).format('MM/DD/YYYY h:mm A');

/**
 * Format the time portion of an event in the user's local timezone or a specified timezone.
 */
export const formatEventTime = (date: Date, tz?: string): string =>
  tz ? dayjs(date).tz(tz).format('h:mm A') : dayjs(date).format('h:mm A');

/**
 * Format the date portion of an event in the user's local timezone or a specified timezone.
 */
export const formatEventDate = (date: Date, tz?: string): string =>
  tz ? dayjs(date).tz(tz).format('MM/DD/YYYY') : dayjs(date).format('MM/DD/YYYY');

/**
 * Format a full timestamp for Slack messages — always Eastern time.
 */
export const formatForSlack = (date: Date): string => dayjs(date).tz('America/New_York').format('M/D/YYYY [at] h:mm A');

/**
 * Format a date for Slack messages — always Eastern time.
 */
export const formatDateForSlack = (date: Date): string => dayjs(date).tz('America/New_York').format('M/D/YYYY');

/**
 * Format a time for Slack messages — always Eastern time.
 */
export const formatTimeForSlack = (date: Date): string => dayjs(date).tz('America/New_York').format('h:mm A');

/**
 * Convert a Date to YYYY-MM-DD string for sending date-only values to the backend.
 */
export const toDateString = (date: Date): string => dayjs(date).format('YYYY-MM-DD');

/**
 * Normalize a Date to midnight UTC, preserving the local calendar date.
 * Use this before sending date-only values to the backend so they pass isDateOnly validation.
 * Example: 2026-03-04T16:49:00 local → 2026-03-04T00:00:00.000Z
 */
export const dateToMidnightUTC = (date: Date): Date =>
  new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));

/**
 * Convert a @db.Date value (midnight UTC) to a local Date representing the same calendar date.
 * Use this when passing date-only values to functions that use local-time methods (getDay, getDate, etc).
 * Example: 2025-03-15T00:00:00Z in UTC-5 → 2025-03-15T00:00:00 local (instead of 2025-03-14T19:00:00 local).
 */
export const dbDateToLocalDate = (date: Date): Date =>
  new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
