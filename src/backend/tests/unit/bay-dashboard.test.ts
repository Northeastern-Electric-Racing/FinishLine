import { Conflict_Status, Event_Status, Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import { batmanAppAdmin } from '../test-data/users.test-data.js';
import BayDashboardService from '../../src/services/bay-dashboard.services.js';
import { DeletedException, NotFoundException } from '../../src/utils/errors.utils.js';
import prisma from '../../src/prisma/prisma.js';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const ORANGE = '#ff9800';
const RED = '#f44336';

type SlotArgs = { startTime: Date; endTime: Date; allDay: boolean };

// a schedule slot that starts `startMs` from now, so the tests don't depend on the day they run
const slotIn = (startMs: number, durationMs = HOUR_MS, allDay = false): SlotArgs => ({
  startTime: new Date(Date.now() + startMs),
  endTime: new Date(Date.now() + startMs + durationMs),
  allDay
});

describe('Bay Dashboard Calendar Tests', () => {
  let organization: Organization;
  let user: User;
  let eventTypeId: string;

  const createCalendar = (
    colorHexCode: string,
    options: { dateCreated?: Date; dateDeleted?: Date; organizationId?: string } = {}
  ) =>
    prisma.calendar.create({
      data: {
        name: `Calendar ${colorHexCode}`,
        description: 'A calendar',
        colorHexCode,
        dateCreated: options.dateCreated,
        dateDeleted: options.dateDeleted,
        userCreated: { connect: { userId: user.userId } },
        organization: { connect: { organizationId: options.organizationId ?? organization.organizationId } }
      }
    });

  const createEventType = async (calendarIds: string[], organizationId = organization.organizationId) => {
    const eventType = await prisma.event_Type.create({
      data: {
        name: 'Meeting',
        takeAttendance: false,
        requiredMembers: false,
        optionalMembers: false,
        teams: false,
        teamType: false,
        location: true,
        zoomLink: false,
        shop: false,
        machinery: false,
        workPackage: false,
        questionDocument: false,
        documents: false,
        description: false,
        onlyHeadsOrAboveForEventCreation: false,
        requiresConfirmation: false,
        sendSlackNotifications: false,
        calendars: { connect: calendarIds.map((calendarId) => ({ calendarId })) },
        userCreated: { connect: { userId: user.userId } },
        organization: { connect: { organizationId } }
      }
    });
    return eventType.eventTypeId;
  };

  const createEvent = (
    title: string,
    slots: SlotArgs[],
    options: { status?: Event_Status; dateDeleted?: Date; location?: string; eventTypeId?: string } = {}
  ) =>
    prisma.event.create({
      data: {
        title,
        status: options.status ?? Event_Status.SCHEDULED,
        approved: Conflict_Status.NO_CONFLICT,
        calendarEventIds: [],
        dateDeleted: options.dateDeleted,
        location: options.location,
        userCreated: { connect: { userId: user.userId } },
        eventType: { connect: { eventTypeId: options.eventTypeId ?? eventTypeId } },
        scheduledTimes: { create: slots }
      }
    });

  const getEvents = () => BayDashboardService.getBayDashboardCalendarEvents(organization.slug);

  beforeEach(async () => {
    organization = await createTestOrganization();
    user = await createTestUser(batmanAppAdmin, organization.organizationId);
    const calendar = await createCalendar(ORANGE);
    eventTypeId = await createEventType([calendar.calendarId]);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get Bay Dashboard Calendar Events', () => {
    it('fails for a slug that does not belong to an organization', async () => {
      await expect(BayDashboardService.getBayDashboardCalendarEvents('missing')).rejects.toThrow(
        new NotFoundException('Organization', 'missing')
      );
    });

    it('fails for a deleted organization', async () => {
      await prisma.organization.update({
        where: { organizationId: organization.organizationId },
        data: { dateDeleted: new Date() }
      });

      await expect(getEvents()).rejects.toThrow(new DeletedException('Organization', organization.slug));
    });

    it('returns nothing when there are no events', async () => {
      expect(await getEvents()).toEqual([]);
    });

    it('returns the title, location, times and the color of the calendar', async () => {
      const slot = slotIn(DAY_MS);
      await createEvent('Design Review', [slot], { location: 'Richards 010' });

      expect(await getEvents()).toEqual([
        {
          title: 'Design Review',
          startTime: slot.startTime,
          endTime: slot.endTime,
          allDay: false,
          location: 'Richards 010',
          colorHexCode: ORANGE
        }
      ]);
    });

    it('returns an event without a location', async () => {
      await createEvent('Bay Time', [slotIn(DAY_MS)]);

      const [event] = await getEvents();

      expect(event.location).toBeUndefined();
    });

    it('returns all day events as all day', async () => {
      await createEvent('Bay Cleanup', [slotIn(DAY_MS, DAY_MS, true)]);

      const [event] = await getEvents();

      expect(event.allDay).toBe(true);
    });

    it('returns a timed event and an all day event with the right all day values', async () => {
      await createEvent('Meeting', [slotIn(DAY_MS, HOUR_MS, false)]);
      await createEvent('Bay Cleanup', [slotIn(2 * DAY_MS, DAY_MS, true)]);

      const events = await getEvents();

      expect(events.map((event) => [event.title, event.allDay])).toEqual([
        ['Meeting', false],
        ['Bay Cleanup', true]
      ]);
    });

    it('returns a multi-day event once, with its full range', async () => {
      const slot = slotIn(DAY_MS, 3 * DAY_MS);
      await createEvent('Competition', [slot]);

      const events = await getEvents();

      expect(events).toHaveLength(1);
      expect(events[0].startTime).toEqual(slot.startTime);
      expect(events[0].endTime).toEqual(slot.endTime);
    });

    it('returns an event once for each of its schedule slots', async () => {
      await createEvent('Weekly Meeting', [slotIn(3 * DAY_MS), slotIn(DAY_MS)]);

      const events = await getEvents();

      expect(events.map((event) => event.title)).toEqual(['Weekly Meeting', 'Weekly Meeting']);
      expect(events[0].startTime.getTime()).toBeLessThan(events[1].startTime.getTime());
    });

    it('orders events by start time', async () => {
      await createEvent('Last', [slotIn(3 * DAY_MS)]);
      await createEvent('First', [slotIn(DAY_MS)]);
      await createEvent('Middle', [slotIn(2 * DAY_MS)]);

      const events = await getEvents();

      expect(events.map((event) => event.title)).toEqual(['First', 'Middle', 'Last']);
    });

    describe('which events are returned', () => {
      it('leaves out events that are not scheduled', async () => {
        await createEvent('Unconfirmed', [slotIn(DAY_MS)], { status: Event_Status.UNCONFIRMED });
        await createEvent('Confirmed', [slotIn(DAY_MS)], { status: Event_Status.CONFIRMED });
        await createEvent('Done', [slotIn(DAY_MS)], { status: Event_Status.DONE });
        await createEvent('Scheduled', [slotIn(DAY_MS)], { status: Event_Status.SCHEDULED });

        const events = await getEvents();

        expect(events.map((event) => event.title)).toEqual(['Scheduled']);
      });

      it('leaves out deleted events', async () => {
        await createEvent('Deleted', [slotIn(DAY_MS)], { dateDeleted: new Date() });
        await createEvent('Active', [slotIn(DAY_MS)]);

        const events = await getEvents();

        expect(events.map((event) => event.title)).toEqual(['Active']);
      });

      it('leaves out events from other organizations', async () => {
        const otherOrganization = await prisma.organization.create({
          data: {
            name: 'Other organization',
            slug: 'other-org',
            description: 'Another organization',
            applicationLink: '',
            userCreated: { connect: { userId: user.userId } }
          }
        });
        const otherCalendar = await createCalendar(RED, { organizationId: otherOrganization.organizationId });
        const otherEventTypeId = await createEventType([otherCalendar.calendarId], otherOrganization.organizationId);
        await createEvent('Other Event', [slotIn(DAY_MS)], { eventTypeId: otherEventTypeId });
        await createEvent('Our Event', [slotIn(DAY_MS)]);

        const events = await getEvents();
        const otherEvents = await BayDashboardService.getBayDashboardCalendarEvents(otherOrganization.slug);

        expect(events.map((event) => event.title)).toEqual(['Our Event']);
        expect(otherEvents.map((event) => event.title)).toEqual(['Other Event']);
      });

      it('leaves out events whose type is not on a calendar', async () => {
        const noCalendarEventTypeId = await createEventType([]);
        await createEvent('No Calendar', [slotIn(DAY_MS)], { eventTypeId: noCalendarEventTypeId });
        await createEvent('On A Calendar', [slotIn(DAY_MS)]);

        const events = await getEvents();

        expect(events.map((event) => event.title)).toEqual(['On A Calendar']);
      });

      it('leaves out events whose type is only on deleted calendars', async () => {
        const deletedCalendar = await createCalendar(RED, { dateDeleted: new Date() });
        const deletedCalendarEventTypeId = await createEventType([deletedCalendar.calendarId]);
        await createEvent('Deleted Calendar', [slotIn(DAY_MS)], { eventTypeId: deletedCalendarEventTypeId });

        expect(await getEvents()).toEqual([]);
      });
    });

    describe('which days are returned', () => {
      it('includes an event up to 7 days ahead and leaves out one after that', async () => {
        await createEvent('Soon', [slotIn(5 * DAY_MS)]);
        await createEvent('Too Far Away', [slotIn(10 * DAY_MS)]);

        const events = await getEvents();

        expect(events.map((event) => event.title)).toEqual(['Soon']);
      });

      it('leaves out events that ended before today', async () => {
        await createEvent('Long Ago', [slotIn(-3 * DAY_MS, HOUR_MS)]);
        await createEvent('Upcoming', [slotIn(DAY_MS)]);

        const events = await getEvents();

        expect(events.map((event) => event.title)).toEqual(['Upcoming']);
      });

      it('includes a multi-day event that started before today and is still going', async () => {
        await createEvent('In Progress', [slotIn(-DAY_MS, 3 * DAY_MS)]);

        const events = await getEvents();

        expect(events.map((event) => event.title)).toEqual(['In Progress']);
      });
    });

    describe('the calendar color', () => {
      it('uses the oldest calendar when the event type is on several', async () => {
        const newer = await createCalendar(RED, { dateCreated: new Date('2025-06-01') });
        const older = await createCalendar('#4caf50', { dateCreated: new Date('2020-06-01') });
        const severalCalendarsEventTypeId = await createEventType([newer.calendarId, older.calendarId]);
        await createEvent('Meeting', [slotIn(DAY_MS)], { eventTypeId: severalCalendarsEventTypeId });

        const [event] = await getEvents();

        expect(event.colorHexCode).toBe('#4caf50');
      });

      it('skips deleted calendars', async () => {
        const deleted = await createCalendar(RED, { dateCreated: new Date('2020-06-01'), dateDeleted: new Date() });
        const active = await createCalendar('#4caf50', { dateCreated: new Date('2025-06-01') });
        const mixedEventTypeId = await createEventType([deleted.calendarId, active.calendarId]);
        await createEvent('Meeting', [slotIn(DAY_MS)], { eventTypeId: mixedEventTypeId });

        const [event] = await getEvents();

        expect(event.colorHexCode).toBe('#4caf50');
      });
    });
  });
});
