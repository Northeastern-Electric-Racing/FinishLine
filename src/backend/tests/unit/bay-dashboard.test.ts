import { Conflict_Status, Event_Status, Organization, User, WBS_Element_Status, Work_Package } from '@prisma/client';
import {
  createTestOrganization,
  createTestProject,
  createTestUser,
  createTestWorkPackage,
  resetUsers
} from '../test-utils.js';
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

describe('Bay Dashboard Overdue Work Packages Tests', () => {
  let organization: Organization;
  let user: User;
  let projectId: string;

  // every work package is on project 0.1, so its wbs number is 0.1.<workPackageNumber>
  const createWorkPackage = async (
    workPackageNumber: number,
    options: { startDate?: Date; status?: WBS_Element_Status; dateDeleted?: Date } = {}
  ): Promise<Work_Package> => {
    const workPackage = await createTestWorkPackage(user, organization.organizationId, projectId, 0, 1, workPackageNumber);
    // undefined fields are left unchanged by prisma
    return prisma.work_Package.update({
      where: { workPackageId: workPackage.workPackageId },
      data: {
        startDate: options.startDate,
        wbsElement: { update: { status: options.status, dateDeleted: options.dateDeleted } }
      }
    });
  };

  const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

  const getOverdue = () => BayDashboardService.getBayDashboardOverdueWorkPackages(organization.slug);

  beforeEach(async () => {
    organization = await createTestOrganization();
    user = await createTestUser(batmanAppAdmin, organization.organizationId);
    const project = await createTestProject(user, organization.organizationId);
    projectId = project.projectId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get Bay Dashboard Overdue Work Packages', () => {
    it('fails for a slug that does not belong to an organization', async () => {
      await expect(BayDashboardService.getBayDashboardOverdueWorkPackages('missing')).rejects.toThrow(
        new NotFoundException('Organization', 'missing')
      );
    });

    it('fails for a deleted organization', async () => {
      await prisma.organization.update({
        where: { organizationId: organization.organizationId },
        data: { dateDeleted: new Date() }
      });

      await expect(getOverdue()).rejects.toThrow(new DeletedException('Organization', organization.slug));
    });

    it('returns nothing when there are no work packages', async () => {
      expect(await getOverdue()).toEqual([]);
    });

    it('returns the wbs numbers, names, leads, managers, end date and days overdue', async () => {
      await createWorkPackage(2);

      const [workPackage] = await getOverdue();

      expect(workPackage).toEqual({
        wbsNum: { carNumber: 0, projectNumber: 1, workPackageNumber: 2 },
        name: 'WP 0.1.2',
        projectWbsNum: { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
        projectName: 'Genesis',
        lead: { userId: user.userId, firstName: user.firstName, lastName: user.lastName },
        manager: { userId: user.userId, firstName: user.firstName, lastName: user.lastName },
        // default start 2024-01-01 with a 4 week duration
        endDate: new Date('2024-01-29'),
        daysOverdue: expect.any(Number),
        blockedBy: []
      });
    });

    it('counts the whole days since the end date', async () => {
      // ends 10 days ago
      await createWorkPackage(1, { startDate: daysAgo(28 + 10) });

      const [workPackage] = await getOverdue();

      expect(workPackage.daysOverdue).toBe(10);
    });

    describe('which work packages are returned', () => {
      it('leaves out work packages that are not overdue yet', async () => {
        // started a week ago with a 4 week duration, so it ends in 3 weeks
        await createWorkPackage(1, { startDate: daysAgo(7) });

        expect(await getOverdue()).toEqual([]);
      });

      it('leaves out completed work packages', async () => {
        await createWorkPackage(1, { status: WBS_Element_Status.COMPLETE });
        await createWorkPackage(2);

        const overdue = await getOverdue();

        expect(overdue.map((workPackage) => workPackage.name)).toEqual(['WP 0.1.2']);
      });

      it('leaves out deleted work packages', async () => {
        await createWorkPackage(1, { dateDeleted: new Date() });
        await createWorkPackage(2);

        const overdue = await getOverdue();

        expect(overdue.map((workPackage) => workPackage.name)).toEqual(['WP 0.1.2']);
      });

      it('leaves out work packages from other organizations', async () => {
        const otherOrganization = await prisma.organization.create({
          data: {
            name: 'Other organization',
            slug: 'other-org',
            description: 'Another organization',
            applicationLink: '',
            userCreated: { connect: { userId: user.userId } }
          }
        });
        const otherProject = await createTestProject(user, otherOrganization.organizationId);
        await createTestWorkPackage(user, otherOrganization.organizationId, otherProject.projectId, 0, 1, 1);
        await createWorkPackage(2);

        const overdue = await getOverdue();
        const otherOverdue = await BayDashboardService.getBayDashboardOverdueWorkPackages(otherOrganization.slug);

        expect(overdue.map((workPackage) => workPackage.name)).toEqual(['WP 0.1.2']);
        expect(otherOverdue.map((workPackage) => workPackage.name)).toEqual(['WP 0.1.1']);
      });
    });

    describe('blockers', () => {
      it('lists the blockers that are not deleted', async () => {
        const workPackage = await createWorkPackage(1);
        const blocker = await createWorkPackage(2);
        const deletedBlocker = await createWorkPackage(3, { dateDeleted: new Date() });
        await prisma.work_Package.update({
          where: { workPackageId: workPackage.workPackageId },
          data: {
            blockedBy: {
              connect: [{ wbsElementId: blocker.wbsElementId }, { wbsElementId: deletedBlocker.wbsElementId }]
            }
          }
        });

        const overdue = await getOverdue();
        const blocked = overdue.find((item) => item.name === 'WP 0.1.1');

        expect(blocked?.blockedBy).toEqual([
          { wbsNum: { carNumber: 0, projectNumber: 1, workPackageNumber: 2 }, name: 'WP 0.1.2' }
        ]);
      });
    });

    it('sorts the most overdue work package first', async () => {
      // ends 2 weeks ago
      await createWorkPackage(1, { startDate: daysAgo(6 * 7) });
      // ends 6 weeks ago
      await createWorkPackage(2, { startDate: daysAgo(10 * 7) });

      const overdue = await getOverdue();

      expect(overdue.map((workPackage) => workPackage.name)).toEqual(['WP 0.1.2', 'WP 0.1.1']);
    });
  });
});
