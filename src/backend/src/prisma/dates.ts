import { Faker } from '@faker-js/faker';
import { DateRange } from './context.js';
import dayjs from 'dayjs';
/*
  https://fakerjs.dev/api/date.html
*/

interface WithFaker {
  faker: Faker;
}

export const SECOND_MS = 1000;
export const MINUTE_MS = SECOND_MS * 60;
export const HOUR_MS = MINUTE_MS * 60;
export const DAY_MS = HOUR_MS * 24;
export const WEEK_MS = DAY_MS * 7;

export const DAYS_PER_WEEK = 7;

export function generateRandomDate({ faker }: WithFaker, from?: Date, to?: Date) {
  return faker.date.between({ from: from ?? '2000-01-01', to: to ?? Date.now() });
}

export function generateRandomDateAround({ faker }: WithFaker, date: Date) {
  return faker.date.recent({ days: 5, refDate: date });
}

export const daysBetween = ({ start, end }: DateRange): number => Math.max(0, dayjs(end).diff(dayjs(start), 'day'));

export const clampDate = (date: Date, { start, end }: DateRange): Date =>
  new Date(Math.min(Math.max(date.getTime(), start.getTime()), end.getTime()));
