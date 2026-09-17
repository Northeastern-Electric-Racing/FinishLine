import { test } from 'node:test';
import { isWithinBuffer } from '../dist';
import { equal } from 'node:assert';

test('newDate is the same as scheduledDates', () => {
  const newDate = new Date(2026, 6, 2);
  const scheduledDate = new Date(2026, 6, 2);
  expect(equal(isWithinBuffer(newDate, scheduledDate, 2), true));
});

test('newDate is a day later than scheduledDates', () => {
  const newDate = new Date(2026, 6, 2);
  const scheduledDate = new Date(2026, 6, 2);
  expect(equal(isWithinBuffer(newDate, scheduledDate, 2), true));
});
