import { busyIntervalsToSlots, removeBusySlotsFromAvailability } from '../../src/utils/ics.utils.js';

describe('ICS Util Tests', () => {
  const at = (day: Date, hour: number, minutes = 0): Date => {
    const date = new Date(day);
    date.setHours(hour, minutes, 0, 0);
    return date;
  };

  describe('busyIntervalsToSlots', () => {
    const day = new Date('2026-06-01T12:00:00');

    it('returns no busy slots when there are no intervals', () => {
      expect(busyIntervalsToSlots([], day)).toEqual(new Set());
    });

    it('maps an interval onto the slots it fully covers', () => {
      const busy = busyIntervalsToSlots([{ start: at(day, 10), end: at(day, 12) }], day);
      expect(busy).toEqual(new Set([0, 1]));
    });

    it('marks a slot busy when an interval only partially overlaps it', () => {
      const busy = busyIntervalsToSlots([{ start: at(day, 13, 30), end: at(day, 14, 30) }], day);
      expect(busy).toEqual(new Set([3, 4]));
    });

    it('ignores intervals outside the 10am-10pm window', () => {
      const busy = busyIntervalsToSlots(
        [
          { start: at(day, 8), end: at(day, 9) },
          { start: at(day, 22), end: at(day, 23) }
        ],
        day
      );
      expect(busy).toEqual(new Set());
    });

    it('ignores intervals on a different day', () => {
      const otherDay = new Date('2026-06-02T12:00:00');
      const busy = busyIntervalsToSlots([{ start: at(otherDay, 12), end: at(otherDay, 13) }], day);
      expect(busy).toEqual(new Set());
    });

    it('uses an exclusive end so a slot-boundary interval does not bleed into the next slot', () => {
      const busy = busyIntervalsToSlots([{ start: at(day, 10), end: at(day, 11) }], day);
      expect(busy).toEqual(new Set([0]));
    });

    it('maps slots onto the UTC calendar date of dateSet, not the timezone-shifted local date', () => {
      const dateSet = new Date('2026-06-02T00:00:00.000Z');
      const localStart = new Date(2026, 5, 2, 10, 0, 0, 0); // 10-11am local on June 2
      const localEnd = new Date(2026, 5, 2, 11, 0, 0, 0);
      expect(busyIntervalsToSlots([{ start: localStart, end: localEnd }], dateSet)).toEqual(new Set([0]));
    });
  });

  describe('removeBusySlotsFromAvailability', () => {
    it('removes only the slots that are busy', () => {
      expect(removeBusySlotsFromAvailability([0, 1, 2, 3], new Set([1, 3]))).toEqual([0, 2]);
    });

    it('returns the availability unchanged when nothing is busy', () => {
      expect(removeBusySlotsFromAvailability([0, 1, 2], new Set())).toEqual([0, 1, 2]);
    });

    it('returns an empty array when every available slot is busy', () => {
      expect(removeBusySlotsFromAvailability([4, 5], new Set([4, 5]))).toEqual([]);
    });
  });
});
