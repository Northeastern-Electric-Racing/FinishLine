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
  const scheduledDate = new Date(2026, 6, 3);
  expect(equal(isWithinBuffer(newDate, scheduledDate, 2), true));
});

test('newDate is two days later than scheduledDates', () => {
  const newDate = new Date(2026, 6, 2);
  const scheduledDate = new Date(2026, 6, 4);
  expect(equal(isWithinBuffer(newDate, scheduledDate, 2), true));
});

test('newDate is three days later than scheduledDates', () => {
  const newDate = new Date(2026, 6, 2);
  const scheduledDate = new Date(2026, 6, 5);
  expect(equal(isWithinBuffer(newDate, scheduledDate, 2), false));
});

test('newDate is two days later than scheduledDates', () => {
  const newDate = new Date(2026, 6, 2);
  const scheduledDateForward = new Date(2026, 6, 3);
  const scheduledDateBackward = new Date(2026, 6, 1);
  expect(equal(isWithinBuffer(newDate, scheduledDateForward, 2), isWithinBuffer(newDate, scheduledDateBackward, 2)));
});
