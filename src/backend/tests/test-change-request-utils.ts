import { describe, it } from 'node:test';
import { isWithinBuffer } from 'shared';

describe('isWithinBuffer', () => {
  it('returns true when newDate is the same as scheduledDate', () => {
    const newDate = new Date(2026, 6, 2);
    const scheduledDate = new Date(2026, 6, 2);

    expect(isWithinBuffer(newDate, scheduledDate, 2)).toBe(true);
  });

  it('returns true when newDate is one day earlier than scheduledDate', () => {
    const newDate = new Date(2026, 6, 2);
    const scheduledDate = new Date(2026, 6, 3);

    expect(isWithinBuffer(newDate, scheduledDate, 2)).toBe(true);
  });

  it('returns true when newDate is two days earlier than scheduledDate', () => {
    const newDate = new Date(2026, 6, 2);
    const scheduledDate = new Date(2026, 6, 4);

    expect(isWithinBuffer(newDate, scheduledDate, 2)).toBe(true);
  });

  it('returns false when newDate is three days earlier than scheduledDate', () => {
    const newDate = new Date(2026, 6, 2);
    const scheduledDate = new Date(2026, 6, 5);

    expect(isWithinBuffer(newDate, scheduledDate, 2)).toBe(false);
  });

  it('returns equal results for forward and backward dates within buffer', () => {
    const newDate = new Date(2026, 6, 2);
    const scheduledDateForward = new Date(2026, 6, 3);
    const scheduledDateBackward = new Date(2026, 6, 1);

    expect(isWithinBuffer(newDate, scheduledDateForward, 2)).toBe(isWithinBuffer(newDate, scheduledDateBackward, 2));
  });
});
