import ical, { ICalEventStatus } from 'ical-generator';
import nodeIcal, { CalendarComponent, RRule, VEvent } from 'node-ical';
import { IcsBusyInterval, Event, wbsPipe } from 'shared';
import { HttpException } from './errors.utils.js';

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

// checks if a given host is blocked (used to mitigate ssrf attacks)
const isBlockedHost = (host: string): boolean => {
  const h = host.toLowerCase();
  return (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '0.0.0.0' ||
    h === '::1' ||
    h.endsWith('.local') ||
    /^10\./.test(h) ||
    /^192\.168\./.test(h) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(h) ||
    /^169\.254\./.test(h) ||
    h.startsWith('::ffff:') ||
    /^fe80:/i.test(h) ||
    /^fc[0-9a-f]{2}:/i.test(h) ||
    /^fd[0-9a-f]{2}:/i.test(h)
  );
};

// checks if a give ics url is valid, throws if invalid
export const validateIcsUrl = (url: string): URL => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new HttpException(400, 'Invalid ICS URL');
  }

  if (parsed.protocol === 'webcal:') parsed.protocol = 'https:';
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new HttpException(400, 'ICS URL must use http or https');
  }
  if (isBlockedHost(parsed.hostname)) {
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
  const validUrl = validateIcsUrl(url);
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

// converts ics date to utc midnight for that day
export const localDayStartForDateSet = (dateSet: Date | string): Date => {
  const date = new Date(dateSet);
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

// converts the ics busy intervals into availability slots (0-11)
export const busyIntervalsToSlots = (busy: IcsBusyInterval[], dateSet: Date | string): Set<number> => {
  const dayStart = localDayStartForDateSet(dateSet);
  const busySlots = new Set<number>();

  const availabilityStart = 10;
  const numAvailabilitySlots = 12;

  for (let slot = 0; slot < numAvailabilitySlots; slot++) {
    const slotStart = new Date(dayStart);
    slotStart.setHours(availabilityStart + slot, 0, 0, 0);
    const slotEnd = new Date(slotStart);
    slotEnd.setHours(slotEnd.getHours() + 1);

    if (busy.some((interval) => interval.start < slotEnd && interval.end > slotStart)) {
      busySlots.add(slot);
    }
  }

  return busySlots;
};

// returns given availability with ics busy slots removed
export const removeBusySlotsFromAvailability = (availability: number[], busySlots: Set<number>): number[] =>
  availability.filter((slot) => !busySlots.has(slot));
