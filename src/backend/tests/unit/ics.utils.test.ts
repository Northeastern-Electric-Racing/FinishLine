import dns from 'node:dns/promises';
import { vi } from 'vitest';
import { busyIntervalsToSlots, removeBusySlotsFromAvailability, validateIcsUrl } from '../../src/utils/ics.utils.js';

vi.mock('node:dns/promises', () => ({ default: { lookup: vi.fn() } }));

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

  describe('validateIcsUrl', () => {
    beforeEach(() => {
      vi.mocked(dns.lookup).mockReset();
    });

    it('accepts an http url whose host resolves to a public address', async () => {
      vi.mocked(dns.lookup).mockResolvedValue([{ address: '93.184.216.34', family: 4 }] as never);
      await expect(validateIcsUrl('http://example.com/cal.ics')).resolves.toBeInstanceOf(URL);
    });

    it('normalizes webcal to https', async () => {
      vi.mocked(dns.lookup).mockResolvedValue([{ address: '93.184.216.34', family: 4 }] as never);
      const result = await validateIcsUrl('webcal://example.com/cal.ics');
      expect(result.protocol).toBe('https:');
    });

    it('rejects a literal loopback IP without needing DNS', async () => {
      vi.mocked(dns.lookup).mockResolvedValue([{ address: '127.0.0.1', family: 4 }] as never);
      await expect(validateIcsUrl('http://127.0.0.1/cal.ics')).rejects.toThrow('ICS URL host is not allowed');
    });

    it('rejects a hostname that resolves to a loopback address', async () => {
      vi.mocked(dns.lookup).mockResolvedValue([{ address: '127.0.0.1', family: 4 }] as never);
      await expect(validateIcsUrl('http://my-site.com/cal.ics')).rejects.toThrow('ICS URL host is not allowed');
    });

    it('rejects a hostname that resolves to a private address', async () => {
      vi.mocked(dns.lookup).mockResolvedValue([{ address: '10.0.0.5', family: 4 }] as never);
      await expect(validateIcsUrl('http://internal.example.com/cal.ics')).rejects.toThrow('ICS URL host is not allowed');
    });

    it('rejects a hostname that resolves to a link-local address', async () => {
      vi.mocked(dns.lookup).mockResolvedValue([{ address: '169.254.169.254', family: 4 }] as never);
      await expect(validateIcsUrl('http://metadata.example.com/cal.ics')).rejects.toThrow('ICS URL host is not allowed');
    });

    it('rejects when any of several resolved addresses is internal', async () => {
      vi.mocked(dns.lookup).mockResolvedValue([
        { address: '93.184.216.34', family: 4 },
        { address: '127.0.0.1', family: 4 }
      ] as never);
      await expect(validateIcsUrl('http://example.com/cal.ics')).rejects.toThrow('ICS URL host is not allowed');
    });

    it('rejects an unresolvable host', async () => {
      vi.mocked(dns.lookup).mockRejectedValue(new Error('ENOTFOUND'));
      await expect(validateIcsUrl('http://does-not-exist.invalid/cal.ics')).rejects.toThrow('ICS URL host is not allowed');
    });

    it('rejects non-http(s) protocols without doing a DNS lookup', async () => {
      await expect(validateIcsUrl('ftp://example.com/cal.ics')).rejects.toThrow('ICS URL must use http or https');
      expect(dns.lookup).not.toHaveBeenCalled();
    });

    it('rejects an unparsable url', async () => {
      await expect(validateIcsUrl('not a url')).rejects.toThrow('Invalid ICS URL');
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
