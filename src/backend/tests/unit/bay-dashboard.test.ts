import { Conflict_Status, Event_Status, Organization, Team, User, WBS_Element_Status, Work_Package } from '@prisma/client';
import { BayDashboardTier } from 'shared';
import {
  createTestCar,
  createTestOrganization,
  createTestProject,
  createTestUser,
  createTestWorkPackage,
  resetUsers
} from '../test-utils.js';
import { batmanAppAdmin, greenlanternHead, member } from '../test-data/users.test-data.js';
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
    const { projectId: createdProjectId } = await createTestProject(user, organization.organizationId);
    projectId = createdProjectId;
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
        lead: { firstName: user.firstName, lastName: user.lastName },
        manager: { firstName: user.firstName, lastName: user.lastName },
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

describe('Bay Dashboard Tier List Tests', () => {
  let organization: Organization;
  let head: User;
  let carId: string;
  let nextProjectNumber: number;

  type TestProject = { projectId: string; projectNumber: number; organizationId: string };

  const daysAgo = (days: number) => new Date(Date.now() - days * DAY_MS);

  const getTierList = () => BayDashboardService.getBayDashboardTierList(organization.slug);

  const createTeam = (
    teamName: string,
    options: { headId?: string; organizationId?: string; dateArchived?: Date } = {}
  ): Promise<Team> =>
    prisma.team.create({
      data: {
        teamName,
        slackId: 'slack',
        headId: options.headId ?? head.userId,
        organizationId: options.organizationId ?? organization.organizationId,
        dateArchived: options.dateArchived
      }
    });

  // a project assigned to the given teams; each project gets its own project number so wbs numbers don't collide
  const createProject = async (
    teams: Team[],
    options: { organizationId?: string; carId?: string; dateDeleted?: Date } = {}
  ): Promise<TestProject> => {
    const organizationId = options.organizationId ?? organization.organizationId;
    const projectNumber = nextProjectNumber++;
    const project = await createTestProject(
      head,
      organizationId,
      undefined,
      options.carId ?? carId,
      0,
      projectNumber,
      options.dateDeleted
    );
    await prisma.project.update({
      where: { projectId: project.projectId },
      data: { teams: { connect: teams.map(({ teamId }) => ({ teamId })) } }
    });
    return { projectId: project.projectId, projectNumber, organizationId };
  };

  // work packages default to starting 2024-01-01 with a 4 week duration, so they're overdue unless told otherwise
  const createWorkPackages = async (
    project: TestProject,
    count: number,
    options: { startDate?: Date; status?: WBS_Element_Status; dateDeleted?: Date } = {}
  ) => {
    const existing = await prisma.work_Package.count({ where: { projectId: project.projectId } });
    for (let i = 1; i <= count; i++) {
      const workPackage = await createTestWorkPackage(
        head,
        project.organizationId,
        project.projectId,
        0,
        project.projectNumber,
        existing + i
      );
      await prisma.work_Package.update({
        where: { workPackageId: workPackage.workPackageId },
        data: {
          startDate: options.startDate,
          wbsElement: { update: { status: options.status, dateDeleted: options.dateDeleted } }
        }
      });
    }
  };

  // a team on its own project with the given number of overdue work packages
  const createTeamWithOverdue = async (teamName: string, overdueCount: number) => {
    const team = await createTeam(teamName);
    await createWorkPackages(await createProject([team]), overdueCount);
    return team;
  };

  const countsByTeam = async () =>
    Object.fromEntries((await getTierList()).map(({ teamName, overdueCount }) => [teamName, overdueCount]));

  beforeEach(async () => {
    organization = await createTestOrganization();
    head = await createTestUser(greenlanternHead, organization.organizationId);
    ({ carId } = await createTestCar(organization.organizationId, head.userId));
    nextProjectNumber = 1;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get Bay Dashboard Tier List', () => {
    it('fails for a slug that does not belong to an organization', async () => {
      await expect(BayDashboardService.getBayDashboardTierList('missing')).rejects.toThrow(
        new NotFoundException('Organization', 'missing')
      );
    });

    it('fails for a deleted organization', async () => {
      await prisma.organization.update({
        where: { organizationId: organization.organizationId },
        data: { dateDeleted: new Date() }
      });

      await expect(getTierList()).rejects.toThrow(new DeletedException('Organization', organization.slug));
    });

    it('returns nothing when there are no teams', async () => {
      expect(await getTierList()).toEqual([]);
    });

    it("returns only the team name, the head's first and last name, the overdue count and the tier", async () => {
      await createTeamWithOverdue('Software', 3);

      expect(await getTierList()).toEqual([
        {
          teamName: 'Software',
          head: { firstName: head.firstName, lastName: head.lastName },
          overdueCount: 3,
          tier: BayDashboardTier.A
        }
      ]);
    });

    describe('teams with zero overdue work packages', () => {
      it('includes a team with no projects with a count of 0 and tier S', async () => {
        await createTeam('Software');

        const [entry] = await getTierList();

        expect(entry).toMatchObject({ teamName: 'Software', overdueCount: 0, tier: BayDashboardTier.S });
      });

      it('includes a team whose work packages are not overdue yet with a count of 0 and tier S', async () => {
        const team = await createTeam('Software');
        const project = await createProject([team]);
        // started a week ago with a 4 week duration, so it ends in 3 weeks
        await createWorkPackages(project, 2, { startDate: daysAgo(7) });

        const [entry] = await getTierList();

        expect(entry).toMatchObject({ teamName: 'Software', overdueCount: 0, tier: BayDashboardTier.S });
      });
    });

    describe('which work packages are counted', () => {
      it("counts the overdue work packages across all of the team's projects", async () => {
        const team = await createTeam('Software');
        await createWorkPackages(await createProject([team]), 2);
        await createWorkPackages(await createProject([team]), 3);

        expect(await countsByTeam()).toEqual({ Software: 5 });
      });

      it('leaves out deleted work packages', async () => {
        const team = await createTeam('Software');
        const project = await createProject([team]);
        await createWorkPackages(project, 2, { dateDeleted: new Date() });
        await createWorkPackages(project, 1);

        expect(await countsByTeam()).toEqual({ Software: 1 });
      });

      it('leaves out work packages on deleted projects', async () => {
        const team = await createTeam('Software');
        await createWorkPackages(await createProject([team], { dateDeleted: new Date() }), 2);
        await createWorkPackages(await createProject([team]), 1);

        expect(await countsByTeam()).toEqual({ Software: 1 });
      });

      it('leaves out completed work packages', async () => {
        const team = await createTeam('Software');
        const project = await createProject([team]);
        await createWorkPackages(project, 2, { status: WBS_Element_Status.COMPLETE });
        await createWorkPackages(project, 1);

        expect(await countsByTeam()).toEqual({ Software: 1 });
      });

      it('leaves out work packages that are not overdue yet', async () => {
        const team = await createTeam('Software');
        const project = await createProject([team]);
        await createWorkPackages(project, 2, { startDate: daysAgo(7) });
        await createWorkPackages(project, 1);

        expect(await countsByTeam()).toEqual({ Software: 1 });
      });

      it('counts a work package on a project shared by two teams for both teams', async () => {
        const software = await createTeam('Software');
        const electrical = await createTeam('Electrical');
        await createWorkPackages(await createProject([software, electrical]), 2);
        await createWorkPackages(await createProject([electrical]), 1);

        expect(await countsByTeam()).toEqual({ Software: 2, Electrical: 3 });
      });
    });

    describe('which teams are returned', () => {
      it('leaves out archived teams', async () => {
        const archived = await createTeam('Archived', { dateArchived: new Date() });
        await createWorkPackages(await createProject([archived]), 1);
        await createTeam('Software');

        expect((await getTierList()).map(({ teamName }) => teamName)).toEqual(['Software']);
      });

      it('leaves out teams from other organizations', async () => {
        const otherOrganization = await prisma.organization.create({
          data: {
            name: 'Other organization',
            slug: 'other-org',
            description: 'Another organization',
            applicationLink: '',
            userCreated: { connect: { userId: head.userId } }
          }
        });
        const otherCarId = (await createTestCar(otherOrganization.organizationId, head.userId)).carId;
        const otherTeam = await createTeam('Other', { organizationId: otherOrganization.organizationId });
        const otherProject = await createProject([otherTeam], {
          organizationId: otherOrganization.organizationId,
          carId: otherCarId
        });
        await createWorkPackages(otherProject, 1);
        await createTeam('Software');

        const tierList = await getTierList();
        const otherTierList = await BayDashboardService.getBayDashboardTierList(otherOrganization.slug);

        expect(tierList.map(({ teamName }) => teamName)).toEqual(['Software']);
        expect(otherTierList.map(({ teamName, overdueCount }) => ({ teamName, overdueCount }))).toEqual([
          { teamName: 'Other', overdueCount: 1 }
        ]);
      });

      it("shows the team's head and not its leads or members", async () => {
        const lead = await createTestUser(batmanAppAdmin, organization.organizationId);
        const teamMember = await createTestUser(member, organization.organizationId);
        const team = await createTeam('Software');
        await prisma.team.update({
          where: { teamId: team.teamId },
          data: {
            leads: { connect: { userId: lead.userId } },
            members: { connect: { userId: teamMember.userId } }
          }
        });

        const [entry] = await getTierList();

        expect(entry.head).toEqual({ firstName: head.firstName, lastName: head.lastName });
      });

      it('includes a team whose head is an admin rather than a head', async () => {
        const admin = await createTestUser(batmanAppAdmin, organization.organizationId);
        await createTeam('Software', { headId: admin.userId });

        const [entry] = await getTierList();

        expect(entry.head).toEqual({ firstName: admin.firstName, lastName: admin.lastName });
      });
    });

    it('assigns each team the tier for its overdue count', async () => {
      await createTeamWithOverdue('S team', 1);
      await createTeamWithOverdue('A team', 2);
      await createTeamWithOverdue('B team', 5);
      await createTeamWithOverdue('D team', 9);
      await createTeamWithOverdue('F team', 10);

      const tierList = await getTierList();

      expect(tierList.map(({ teamName, tier }) => ({ teamName, tier }))).toEqual([
        { teamName: 'S team', tier: BayDashboardTier.S },
        { teamName: 'A team', tier: BayDashboardTier.A },
        { teamName: 'B team', tier: BayDashboardTier.B },
        { teamName: 'D team', tier: BayDashboardTier.D },
        { teamName: 'F team', tier: BayDashboardTier.F }
      ]);
    });

    it('sorts the fewest overdue work packages first, then by team name', async () => {
      await createTeamWithOverdue('Mechanical', 4);
      await createTeamWithOverdue('Software', 1);
      await createTeamWithOverdue('Electrical', 4);
      await createTeam('Business');

      const tierList = await getTierList();

      expect(tierList.map(({ teamName, overdueCount }) => ({ teamName, overdueCount }))).toEqual([
        { teamName: 'Business', overdueCount: 0 },
        { teamName: 'Software', overdueCount: 1 },
        { teamName: 'Electrical', overdueCount: 4 },
        { teamName: 'Mechanical', overdueCount: 4 }
      ]);
    });
  });
});
