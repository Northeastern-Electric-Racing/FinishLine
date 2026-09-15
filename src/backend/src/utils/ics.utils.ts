import ical, { ICalEventStatus } from 'ical-generator';
import nodeIcal, { CalendarComponent, RRule, VEvent } from 'node-ical';
import dns from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
import dayjs from 'dayjs';
import 'dayjs/plugin/utc.js';
import 'dayjs/plugin/timezone.js';
import { IcsBusyInterval, Event, wbsPipe, EASTERN_TIMEZONE } from 'shared';
import { HttpException } from './errors.utils.js';

// availability slots are defined relative to Eastern time (see frontend design-review.utils.ts ESTOffset),
// regardless of what timezone the server process happens to run in
const BUSINESS_TIMEZONE = EASTERN_TIMEZONE;

export const generateIcsFeed = (events: Event[]): string => {
  const cal = ical({ name: 'Northeastern Electric Racing' });

  for (const event of events) {
    for (const slot of event.scheduledTimes) {
      const descriptionParts: string[] = [];
      if (event.description) descriptionParts.push(event.description);

      const memberName = (m: { firstName: string; lastName: string }) => `${m.firstName} ${m.lastName}`;
      if (event.requiredMembers.length > 0)
        descriptionParts.push(`Required: ${event.requiredMembers.map(memberName).join(', ')}`);
      if (event.optionalMembers.length > 0)
        descriptionParts.push(`Optional: ${event.optionalMembers.map(memberName).join(', ')}`);

      if (event.zoomLink) descriptionParts.push(`Zoom: ${event.zoomLink}`);
      if (event.teams.length > 0) descriptionParts.push(`Teams: ${event.teams.map((team) => team.teamName).join(', ')}`);
      if (event.shops.length > 0) descriptionParts.push(`Shops: ${event.shops.map((shop) => shop.name).join(', ')}`);
      if (event.machinery.length > 0)
        descriptionParts.push(`Machinery: ${event.machinery.map((machine) => machine.name).join(', ')}`);
      if (event.workPackages.length > 0)
        descriptionParts.push(
          `Work Package: ${event.workPackages.map((wp) => `${wp.wbsElement.name} (${wbsPipe(wp.wbsElement)})`).join(', ')}`
        );

      cal.createEvent({
        id: `${event.eventId}-${slot.scheduleSlotId}@finishlinebyner.com`,
        summary: event.title,
        start: slot.startTime,
        end: slot.endTime,
        allDay: slot.allDay,
        description: descriptionParts.length > 0 ? descriptionParts.join('\n\n') : undefined,
        location: event.location ?? event.zoomLink ?? undefined,
        status: ICalEventStatus.CONFIRMED,
        organizer: { name: event.userCreated.firstName + ' ' + event.userCreated.lastName, email: event.userCreated.email }
      });
    }
  }

  return cal.toString();
};

interface VEventWithExtras extends Omit<VEvent, 'rrule'> {
  rrule?: Pick<RRule, 'between'>;
  transparency?: string;
  exdate?: Record<string, Date>;
  recurrences?: Record<string, VEventRecurrenceOverride>;
}

interface VEventRecurrenceOverride extends VEvent {
  recurrenceid?: Date;
}

// resolves the host and checks whether any resolved address is blocked (used to mitigate SSRF attacks).
// Uses dns.lookup (rather than dns.resolve) since it goes through the same OS resolver - including
// /etc/hosts and NSS config - that the actual fetch will use, and it accepts literal IPs unchanged, so this
// also catches URLs that use an IP directly. ipaddr.js classifies the resolved address's range for us
// (loopback/private/link-local/reserved/carrier-grade-NAT/etc, for both IPv4 and IPv6, including
// IPv4-mapped IPv6 addresses) rather than us hand-maintaining that list. This does not protect against DNS
// rebinding (the host re-resolving to a different, internal address between this check and the real fetch)
// - closing that gap would require pinning the connection to the address we resolved here.
const isBlockedHost = async (hostname: string): Promise<boolean> => {
  let addresses;
  try {
    addresses = await dns.lookup(hostname, { all: true });
  } catch {
    return true; // unresolvable host - fail closed
  }

  return addresses.length === 0 || addresses.some(({ address }) => ipaddr.process(address).range() !== 'unicast');
};

// checks if a give ics url is valid, throws if invalid
export const validateIcsUrl = async (url: string): Promise<URL> => {
  // rewritten before parsing rather than via `parsed.protocol = 'https:'` - the WHATWG URL setter silently
  // no-ops when switching from a "not special" scheme (webcal) to a "special" one (https)
  const normalizedUrl = url.replace(/^webcal:/i, 'https:');

  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    throw new HttpException(400, 'Invalid ICS URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new HttpException(400, 'ICS URL must use http or https');
  }
  if (await isBlockedHost(parsed.hostname)) {
    throw new HttpException(400, 'ICS URL host is not allowed');
  }
  return parsed;
};

// fetches the text from the ics url
const fetchIcsText = async (url: URL): Promise<string> => {
  // timeout after 10,000 ms
  const fetchTimeoutMs = 10000;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'error' });
    if (!res.ok) throw new HttpException(502, `Failed to fetch ICS feed (status ${res.status})`);
    return await res.text();
  } catch (err) {
    if (err instanceof HttpException) throw err;
    if (err instanceof Error && err.name === 'AbortError') {
      throw new HttpException(504, 'ICS feed fetch timed out');
    }
    throw new HttpException(502, 'Failed to fetch ICS feed');
  } finally {
    clearTimeout(timeout);
  }
};

/**
 * Fetches an ICS calendar feed and returns busy intervals overlapping [rangeStart, rangeEnd).
 * Expands RRULE recurrences, applies EXDATE exclusions, and honors per-occurrence overrides
 * (RECURRENCE-ID). Skips events marked CANCELLED or TRANSPARENT (free).
 */
export const fetchIcsBusyTimes = async (url: string, rangeStart: Date, rangeEnd: Date): Promise<IcsBusyInterval[]> => {
  const validUrl = await validateIcsUrl(url);
  const icsText = await fetchIcsText(validUrl);

  let parsed: Record<string, CalendarComponent | undefined>;
  try {
    parsed = nodeIcal.sync.parseICS(icsText);
  } catch {
    throw new HttpException(400, 'ICS feed could not be parsed');
  }

  const busy: IcsBusyInterval[] = [];

  for (const component of Object.values(parsed)) {
    if (!component || component.type !== 'VEVENT') continue;
    const ev = component as VEventWithExtras;

    if (ev.status === 'CANCELLED') continue;
    if (ev.transparency === 'TRANSPARENT') continue;

    const baseStart = ev.start as Date | undefined;
    const baseEnd = ev.end as Date | undefined;
    if (!baseStart || !baseEnd) continue;

    const { rrule } = ev;

    if (!rrule) {
      if (baseEnd > rangeStart && baseStart < rangeEnd) {
        busy.push({ start: baseStart, end: baseEnd });
      }
      continue;
    }

    const durationMs = baseEnd.getTime() - baseStart.getTime();
    const occurrences = rrule.between(rangeStart, rangeEnd, true);

    const exdateMap = ev.exdate ?? {};
    const exdateTimes = new Set<number>(Object.values(exdateMap).map((d) => d.getTime()));

    const recurrenceMap = ev.recurrences ?? {};
    const recurrencesByTime = new Map<number, VEventRecurrenceOverride>();
    for (const override of Object.values(recurrenceMap)) {
      const recId = override.recurrenceid ?? (override.start as Date);
      if (recId) recurrencesByTime.set(recId.getTime(), override);
    }

    for (const occ of occurrences) {
      const occTime = occ.getTime();
      if (exdateTimes.has(occTime)) continue;

      const override = recurrencesByTime.get(occTime);
      if (override) {
        if (override.status === 'CANCELLED') continue;
        const oStart = override.start as Date | undefined;
        const oEnd = override.end as Date | undefined;
        if (oStart && oEnd && oEnd > rangeStart && oStart < rangeEnd) {
          busy.push({ start: oStart, end: oEnd });
        }
        continue;
      }

      const occEnd = new Date(occTime + durationMs);
      if (occEnd > rangeStart && occ < rangeEnd) {
        busy.push({ start: occ, end: occEnd });
      }
    }
  }

  return busy;
};

export const localDayStartForDateSet = (dateSet: Date | string): dayjs.Dayjs => {
  const dayString = dayjs.utc(dateSet).format('YYYY-MM-DD');
  return dayjs.tz(dayString, BUSINESS_TIMEZONE);
};

// converts the ics busy intervals (real UTC instants) into availability slots (0-11), where slot N
// covers the hour (10 + N) in BUSINESS_TIMEZONE - not the server process's local timezone
export const busyIntervalsToSlots = (busy: IcsBusyInterval[], dateSet: Date | string): Set<number> => {
  const dayStart = localDayStartForDateSet(dateSet);
  const busySlots = new Set<number>();

  const availabilityStart = 10;
  const numAvailabilitySlots = 12;

  for (let slot = 0; slot < numAvailabilitySlots; slot++) {
    const slotStart = dayStart.add(availabilityStart + slot, 'hour').toDate();
    const slotEnd = dayStart.add(availabilityStart + slot + 1, 'hour').toDate();

    if (busy.some((interval) => interval.start < slotEnd && interval.end > slotStart)) {
      busySlots.add(slot);
    }
  }

  return busySlots;
};

// returns given availability with ics busy slots removed
export const removeBusySlotsFromAvailability = (availability: number[], busySlots: Set<number>): number[] =>
  availability.filter((slot) => !busySlots.has(slot));
