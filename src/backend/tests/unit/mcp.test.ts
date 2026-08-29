import { Conflict_Status, Event_Status, Organization, Task_Priority, Task_Status, User } from '@prisma/client';
import {
  createTestCar,
  createTestOrganization,
  createTestProject,
  createTestUser,
  createTestWorkPackage,
  resetUsers
} from '../test-utils.js';
import { batmanAppAdmin } from '../test-data/users.test-data.js';
import { HttpException, NotFoundException } from '../../src/utils/errors.utils.js';
import prisma from '../../src/prisma/prisma.js';
import McpService from '../../src/services/mcp.services.js';

describe('MCP Endpoint Tests', () => {
  let organization: Organization;
  let orgId: string;
  let user: User;
  let carId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    user = await createTestUser(batmanAppAdmin, orgId);
    carId = (await createTestCar(orgId, user.userId, 1)).carId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  const makeProject = (projectNumber: number) => createTestProject(user, orgId, undefined, carId, 1, projectNumber);

  describe('Get Projects By Car Number', () => {
    it('returns only projects on the requested car', async () => {
      const otherCarId = (await createTestCar(orgId, user.userId, 2)).carId;
      await makeProject(1);
      await createTestProject(user, orgId, undefined, otherCarId, 2, 1);

      const projects = await McpService.getProjectsByCarNumber(1, organization);

      expect(projects).toHaveLength(1);
      expect(projects[0].wbsNum).toBe('1.1.0');
      expect(projects[0].viewOnFinishline).toContain('/projects/1.1.0');
    });

    it('excludes soft deleted projects', async () => {
      await makeProject(1);
      await createTestProject(user, orgId, undefined, carId, 1, 2, new Date());

      const projects = await McpService.getProjectsByCarNumber(1, organization);

      expect(projects).toHaveLength(1);
      expect(projects[0].wbsNum).toBe('1.1.0');
    });

    it('returns an empty list for a car with no projects', async () => {
      expect(await McpService.getProjectsByCarNumber(9, organization)).toEqual([]);
    });
  });

  describe('Get Project', () => {
    it('collapses users to name strings and leaks no user object', async () => {
      await makeProject(1);

      const project = await McpService.getProject('1.1.0', organization);

      expect(project.lead).toBe(`${user.firstName} ${user.lastName}`);
      expect(project.manager).toBe(`${user.firstName} ${user.lastName}`);
      expect(JSON.stringify(project)).not.toContain('userId');
      expect(JSON.stringify(project)).not.toContain('googleAuthId');
    });

    it('derives status and dates from work packages', async () => {
      const project = await makeProject(1);
      await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 1);

      const detail = await McpService.getProject('1.1.0', organization);

      // the helper creates ACTIVE work packages
      expect(detail.status).toBe('ACTIVE');
      expect(detail.workPackageCount).toBe(1);
      expect(detail.startDate).toEqual(new Date('2024-01-01'));
      // start date plus the 4 week duration
      expect(detail.endDate).toEqual(new Date('2024-01-29'));
    });

    it('reports a project with no work packages as inactive', async () => {
      await makeProject(1);

      const detail = await McpService.getProject('1.1.0', organization);

      expect(detail.status).toBe('INACTIVE');
      expect(detail.startDate).toBeUndefined();
      expect(detail.workPackageCount).toBe(0);
    });

    it('rejects a work package wbs number', async () => {
      await expect(async () => await McpService.getProject('1.1.1', organization)).rejects.toThrow(
        new HttpException(400, '"1.1.1" is a work package, not a project')
      );
    });

    it('rejects a malformed wbs number', async () => {
      await expect(async () => await McpService.getProject('nonsense', organization)).rejects.toThrow(HttpException);
    });

    it('throws when the project does not exist', async () => {
      await expect(async () => await McpService.getProject('1.9.0', organization)).rejects.toThrow(
        new NotFoundException('Project', '1.9.0')
      );
    });
  });

  describe('Get Work Packages', () => {
    it('groups description bullets by their type name', async () => {
      const project = await makeProject(1);
      const workPackage = await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 1);

      const makeType = (name: string) =>
        prisma.description_Bullet_Type.create({
          data: {
            name,
            projectRequired: false,
            workPackageRequired: false,
            organizationId: orgId,
            userCreatedId: user.userId
          }
        });

      const deliverables = await makeType('Deliverables');
      const activities = await makeType('Expected Activities');

      await prisma.description_Bullet.createMany({
        data: [
          { detail: 'Ship the box', descriptionBulletTypeId: deliverables.id, wbsElementId: workPackage.wbsElementId },
          { detail: 'Ship the lid', descriptionBulletTypeId: deliverables.id, wbsElementId: workPackage.wbsElementId },
          { detail: 'Design it', descriptionBulletTypeId: activities.id, wbsElementId: workPackage.wbsElementId }
        ]
      });

      const workPackages = await McpService.getWorkPackages('1.1.0', organization);

      expect(workPackages).toHaveLength(1);
      const grouped = workPackages[0].descriptionBullets;
      expect(grouped).toHaveLength(2);
      expect(grouped.find((g) => g.type === 'Deliverables')?.details).toEqual(['Ship the box', 'Ship the lid']);
      expect(grouped.find((g) => g.type === 'Expected Activities')?.details).toEqual(['Design it']);
    });

    it('computes the end date from start date plus duration', async () => {
      const project = await makeProject(1);
      await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 1);

      const [workPackage] = await McpService.getWorkPackages('1.1.0', organization);

      expect(workPackage.wbsNum).toBe('1.1.1');
      expect(workPackage.durationWeeks).toBe(4);
      expect(workPackage.endDate).toEqual(new Date('2024-01-29'));
      expect(workPackage.lead).toBe(`${user.firstName} ${user.lastName}`);
    });
  });

  describe('Get Tasks', () => {
    const makeTask = (wbsElementId: string, title: string) =>
      prisma.task.create({
        data: {
          title,
          notes: '',
          priority: Task_Priority.HIGH,
          status: Task_Status.IN_PROGRESS,
          createdByUserId: user.userId,
          wbsElementId,
          assignees: { connect: { userId: user.userId } }
        }
      });

    it('includes tasks on the project and on its work packages', async () => {
      const project = await makeProject(1);
      const projectWbsElement = await prisma.project.findUniqueOrThrow({
        where: { projectId: project.projectId },
        select: { wbsElementId: true }
      });
      const workPackage = await createTestWorkPackage(user, orgId, project.projectId, 1, 1, 1);

      await makeTask(projectWbsElement.wbsElementId, 'Project task');
      await makeTask(workPackage.wbsElementId, 'Work package task');

      const tasks = await McpService.getTasks('1.1.0', organization);

      expect(tasks.map((task) => task.title).sort()).toEqual(['Project task', 'Work package task']);
      expect(tasks.find((task) => task.title === 'Work package task')?.parentWbsNum).toBe('1.1.1');
      expect(tasks.find((task) => task.title === 'Project task')?.parentWbsNum).toBe('1.1.0');
    });

    it('collapses assignees to name strings and links to the project tasks tab', async () => {
      const project = await makeProject(1);
      const projectWbsElement = await prisma.project.findUniqueOrThrow({
        where: { projectId: project.projectId },
        select: { wbsElementId: true }
      });
      await makeTask(projectWbsElement.wbsElementId, 'Project task');

      const [task] = await McpService.getTasks('1.1.0', organization);

      expect(task.assignees).toEqual([`${user.firstName} ${user.lastName}`]);
      expect(task.createdBy).toBe(`${user.firstName} ${user.lastName}`);
      expect(task.viewOnFinishline).toContain('/projects/1.1.0/tasks');
      expect(JSON.stringify(task)).not.toContain('googleAuthId');
    });

    it('excludes soft deleted tasks', async () => {
      const project = await makeProject(1);
      const projectWbsElement = await prisma.project.findUniqueOrThrow({
        where: { projectId: project.projectId },
        select: { wbsElementId: true }
      });
      const task = await makeTask(projectWbsElement.wbsElementId, 'Deleted task');
      await prisma.task.update({ where: { taskId: task.taskId }, data: { dateDeleted: new Date() } });

      expect(await McpService.getTasks('1.1.0', organization)).toEqual([]);
    });
  });

  describe('Get Events', () => {
    const createEvent = async (slots: { startTime: Date; endTime: Date }[]) => {
      const calendar = await prisma.calendar.create({
        data: {
          name: 'Software',
          description: 'Software calendar',
          colorHexCode: '#fff',
          organizationId: orgId,
          userCreatedId: user.userId
        }
      });

      const eventType = await prisma.event_Type.create({
        data: {
          name: 'Meeting',
          organizationId: orgId,
          userCreatedId: user.userId,
          requiredMembers: false,
          optionalMembers: false,
          teams: false,
          teamType: false,
          location: false,
          zoomLink: false,
          shop: false,
          machinery: false,
          workPackage: false,
          questionDocument: false,
          documents: false,
          description: true,
          onlyHeadsOrAboveForEventCreation: false,
          requiresConfirmation: false,
          sendSlackNotifications: false,
          calendars: { connect: { calendarId: calendar.calendarId } }
        }
      });

      return prisma.event.create({
        data: {
          title: 'Weekly Sync',
          description: 'Team sync',
          userCreatedId: user.userId,
          eventTypeId: eventType.eventTypeId,
          approved: Conflict_Status.APPROVED,
          status: Event_Status.SCHEDULED,
          scheduledTimes: { create: slots.map((slot) => ({ ...slot, allDay: false })) }
        }
      });
    };

    it('returns events overlapping the range with their calendar names', async () => {
      await createEvent([{ startTime: new Date('2026-09-02T10:00:00Z'), endTime: new Date('2026-09-02T11:00:00Z') }]);

      const events = await McpService.getEvents(new Date('2026-09-01'), new Date('2026-09-07'), organization);

      expect(events).toHaveLength(1);
      expect(events[0].title).toBe('Weekly Sync');
      expect(events[0].calendars).toEqual(['Software']);
      expect(events[0].eventType).toBe('Meeting');
      expect(events[0].recurring).toBe(false);
      expect(events[0].times).toHaveLength(1);
      expect(events[0].viewOnFinishline).toContain('/calendar/event/');
    });

    it('excludes events outside the range', async () => {
      await createEvent([{ startTime: new Date('2026-10-02T10:00:00Z'), endTime: new Date('2026-10-02T11:00:00Z') }]);

      expect(await McpService.getEvents(new Date('2026-09-01'), new Date('2026-09-07'), organization)).toEqual([]);
    });

    it('returns only the occurrences of a recurring event that fall inside the range', async () => {
      await createEvent([
        { startTime: new Date('2026-09-02T10:00:00Z'), endTime: new Date('2026-09-02T11:00:00Z') },
        { startTime: new Date('2026-09-05T10:00:00Z'), endTime: new Date('2026-09-05T11:00:00Z') },
        // outside the requested week
        { startTime: new Date('2026-09-16T10:00:00Z'), endTime: new Date('2026-09-16T11:00:00Z') },
        { startTime: new Date('2026-09-23T10:00:00Z'), endTime: new Date('2026-09-23T11:00:00Z') }
      ]);

      const [event] = await McpService.getEvents(new Date('2026-09-01'), new Date('2026-09-07'), organization);

      expect(event.times).toHaveLength(2);
      expect(event.times.map((time) => time.startTime)).toEqual([
        new Date('2026-09-02T10:00:00Z'),
        new Date('2026-09-05T10:00:00Z')
      ]);
      // still recurring even though the other occurrences were filtered out
      expect(event.recurring).toBe(true);
    });

    it('rejects a range wider than a week', async () => {
      await expect(
        async () => await McpService.getEvents(new Date('2026-09-01'), new Date('2026-09-09'), organization)
      ).rejects.toThrow(new HttpException(400, 'Date range must be 7 days or fewer'));
    });

    it('rejects an inverted range', async () => {
      await expect(
        async () => await McpService.getEvents(new Date('2026-09-07'), new Date('2026-09-01'), organization)
      ).rejects.toThrow(new HttpException(400, 'endDate must be on or after startDate'));
    });
  });
});
