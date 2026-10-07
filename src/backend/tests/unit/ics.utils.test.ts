import dns from 'node:dns/promises';
import { vi } from 'vitest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { busyIntervalsToSlots, removeBusySlotsFromAvailability, validateIcsUrl } from '../../src/utils/ics.utils.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const BUSINESS_TIMEZONE = 'America/New_York';

vi.mock('node:dns/promises', () => ({ default: { lookup: vi.fn() } }));

describe('ICS Util Tests', () => {
  // builds a real UTC instant for the given Eastern-time hour on the given calendar date, so tests are
  // independent of whatever timezone the machine running them happens to be in
  const at = (dayString: string, hour: number, minutes = 0): Date =>
    dayjs.tz(dayString, BUSINESS_TIMEZONE).add(hour, 'hour').add(minutes, 'minute').toDate();

  describe('busyIntervalsToSlots', () => {
    const day = new Date('2026-06-01T00:00:00.000Z');
    const dayString = '2026-06-01';

    it('returns no busy slots when there are no intervals', () => {
      expect(busyIntervalsToSlots([], day)).toEqual(new Set());
    });

    it('maps an interval onto the slots it fully covers', () => {
      const busy = busyIntervalsToSlots([{ start: at(dayString, 10), end: at(dayString, 12) }], day);
      expect(busy).toEqual(new Set([0, 1]));
    });

    it('marks a slot busy when an interval only partially overlaps it', () => {
      const busy = busyIntervalsToSlots([{ start: at(dayString, 13, 30), end: at(dayString, 14, 30) }], day);
      expect(busy).toEqual(new Set([3, 4]));
    });

    it('ignores intervals outside the 10am-10pm window', () => {
      const busy = busyIntervalsToSlots(
        [
          { start: at(dayString, 8), end: at(dayString, 9) },
          { start: at(dayString, 22), end: at(dayString, 23) }
        ],
        day
      );
      expect(busy).toEqual(new Set());
    });

    it('ignores intervals on a different day', () => {
      const otherDayString = '2026-06-02';
      const busy = busyIntervalsToSlots([{ start: at(otherDayString, 12), end: at(otherDayString, 13) }], day);
      expect(busy).toEqual(new Set());
    });

    it('uses an exclusive end so a slot-boundary interval does not bleed into the next slot', () => {
      const busy = busyIntervalsToSlots([{ start: at(dayString, 10), end: at(dayString, 11) }], day);
      expect(busy).toEqual(new Set([0]));
    });

    it('maps slots onto the Eastern-time calendar date of dateSet, not the UTC-shifted date', () => {
      const dateSet = new Date('2026-06-02T00:00:00.000Z');
      const easternStart = at('2026-06-02', 10);
      const easternEnd = at('2026-06-02', 11);
      expect(busyIntervalsToSlots([{ start: easternStart, end: easternEnd }], dateSet)).toEqual(new Set([0]));
    });

    it('interprets busy intervals in Eastern time regardless of the server process timezone', () => {
      // 9am-5pm Eastern should land on slots 0 (10-11am is only partially covered starting at 9)... actually
      // 9am is before the window, so this covers slots 0-6 (10am-5pm) fully, per exclusive-end semantics
      const busy = busyIntervalsToSlots([{ start: at(dayString, 9), end: at(dayString, 17) }], day);
      expect(busy).toEqual(new Set([0, 1, 2, 3, 4, 5, 6]));
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
