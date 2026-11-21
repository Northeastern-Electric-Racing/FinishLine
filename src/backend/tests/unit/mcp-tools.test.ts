import express from 'express';
import request from 'supertest';
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
import prisma from '../../src/prisma/prisma.js';
import ApiTokenService from '../../src/services/api-tokens.services.js';
import { mcpNodeHandler } from '../../src/mcp/handler.js';
import { attachAuthInfo, requireApiToken } from '../../src/utils/mcp-auth.utils.js';
import { errorHandler } from '../../src/utils/errors.utils.js';

/**
 * Drives the MCP tools through /mcp the way index.ts mounts it, authenticated with real API tokens. The
 * tools call the same services the app does, so these cover what sits on top of them: tool
 * registration, schema validation, paging, and how failures reach the model.
 */

/** How many items one page of the paged tasks service holds. */
const PAGE_SIZE = 20;
describe('MCP Tools', () => {
  let organization: Organization;
  let orgId: string;
  let admin: User;
  let adminToken: string;
  let carId: string;
  let app: express.Express;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    admin = await createTestUser(batmanAppAdmin, orgId);
    adminToken = (await ApiTokenService.generateApiToken(admin, organization)).token;
    ({ carId } = await createTestCar(orgId, admin.userId, 1));

    // mounted the way index.ts does
    app = express();
    app.use(express.json());
    app.all('/mcp', requireApiToken, attachAuthInfo, (req, res, next) => {
      mcpNodeHandler(req, res, req.body).catch(next);
    });
    app.use(errorHandler);
  });

  afterEach(async () => {
    await resetUsers();
  });

  /** Sends one JSON-RPC request to /mcp and returns its result, whether it came back as JSON or SSE. */
  const rpc = async (method: string, params: object, token: string = adminToken) => {
    const res = await request(app)
      .post('/mcp')
      .set('x-api-key', token)
      .set('Accept', 'application/json, text/event-stream')
      .send({ jsonrpc: '2.0', id: 1, method, params });
    const sseData = res.text.split('\n').find((line) => line.startsWith('data: '));
    return (sseData ? JSON.parse(sseData.slice('data: '.length)) : res.body).result;
  };

  /** Calls a tool and returns its parsed JSON payload, or the raw result when the call failed. */
  const callTool = async (name: string, args: object, token?: string) => {
    const result = await rpc('tools/call', { name, arguments: args }, token);
    return { result, data: result.isError ? undefined : JSON.parse(result.content[0].text) };
  };

  const makeProject = (projectNumber: number, projectCarId = carId, carNumber = 1) =>
    createTestProject(admin, orgId, undefined, projectCarId, carNumber, projectNumber);

  const makeTask = (wbsElementId: string, title: string) =>
    prisma.task.create({
      data: {
        title,
        notes: '',
        priority: Task_Priority.HIGH,
        status: Task_Status.IN_PROGRESS,
        createdByUserId: admin.userId,
        wbsElementId,
        assignees: { connect: { userId: admin.userId } }
      }
    });

  const projectWbsElementId = async (projectId: string) =>
    (await prisma.project.findUniqueOrThrow({ where: { projectId }, select: { wbsElementId: true } })).wbsElementId;

  it('registers the tools from every domain file', async () => {
    const { tools } = await rpc('tools/list', {});

    expect(tools.map((tool: { name: string }) => tool.name).sort()).toEqual([
      'finishline_get_events',
      'finishline_get_project',
      'finishline_get_tasks',
      'finishline_list_cars',
      'finishline_list_projects'
    ]);
  });

  describe('List Cars', () => {
    it("lists the organization's cars", async () => {
      await createTestCar(orgId, admin.userId, 2);

      const { data } = await callTool('finishline_list_cars', {});

      expect(data.map((car: { wbsNum: { carNumber: number } }) => car.wbsNum.carNumber).sort()).toEqual([1, 2]);
    });
  });

  describe('List Projects', () => {
    it('lists only the requested car', async () => {
      const newerCarId = (await createTestCar(orgId, admin.userId, 2)).carId;
      await makeProject(1);
      await makeProject(1, newerCarId, 2);

      const { data } = await callTool('finishline_list_projects', { carId: newerCarId });

      expect(data.map((project: { wbsNum: object }) => project.wbsNum)).toEqual([
        { carNumber: 2, projectNumber: 1, workPackageNumber: 0 }
      ]);
    });

    it('lists every car when no car is given', async () => {
      const newerCarId = (await createTestCar(orgId, admin.userId, 2)).carId;
      await makeProject(1);
      await makeProject(1, newerCarId, 2);

      const { data } = await callTool('finishline_list_projects', {});

      expect(data).toHaveLength(2);
    });
  });

  describe('Get Project', () => {
    it('returns the project with its work packages', async () => {
      const project = await makeProject(1);
      await createTestWorkPackage(admin, orgId, project.projectId, 1, 1, 1);

      const { data } = await callTool('finishline_get_project', { wbsNum: '1.1.0' });

      expect(data.wbsNum).toEqual({ carNumber: 1, projectNumber: 1, workPackageNumber: 0 });
      expect(data.workPackages).toHaveLength(1);
      expect(data.workPackages[0].wbsNum.workPackageNumber).toBe(1);
      expect(JSON.stringify(data)).not.toContain('googleAuthId');
    });

    it('rejects a work package wbs number with a hint', async () => {
      const { result } = await callTool('finishline_get_project', { wbsNum: '1.1.1' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('not a valid project WBS');
      expect(result.content[0].text).toContain('finishline_list_projects');
    });

    it('rejects a malformed wbs number before reaching the service', async () => {
      const { result } = await callTool('finishline_get_project', { wbsNum: '1.2' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('three numbers separated by dots');
    });

    it('reports a project that does not exist', async () => {
      const { result } = await callTool('finishline_get_project', { wbsNum: '1.9.0' });

      expect(result.isError).toBe(true);
    });
  });

  describe('Get Tasks', () => {
    it('includes tasks on the project and on its work packages', async () => {
      const project = await makeProject(1);
      const workPackage = await createTestWorkPackage(admin, orgId, project.projectId, 1, 1, 1);
      await makeTask(await projectWbsElementId(project.projectId), 'Project task');
      await makeTask(workPackage.wbsElementId, 'Work package task');

      const { data } = await callTool('finishline_get_tasks', { wbsNum: '1.1.0' });

      expect(data.nextOffset).toBeUndefined();
      expect(data.tasks.map((task: { title: string }) => task.title).sort()).toEqual(['Project task', 'Work package task']);
    });

    it('pages through every task exactly once', async () => {
      const project = await makeProject(1);
      const wbsElementId = await projectWbsElementId(project.projectId);
      for (let i = 0; i < PAGE_SIZE + 1; i++) await makeTask(wbsElementId, `Task ${i}`);

      const { data: first } = await callTool('finishline_get_tasks', { wbsNum: '1.1.0' });
      const { data: second } = await callTool('finishline_get_tasks', { wbsNum: '1.1.0', offset: first.nextOffset });

      const ids = [...first.tasks, ...second.tasks].map((task: { taskId: string }) => task.taskId);
      expect(first.tasks).toHaveLength(PAGE_SIZE);
      expect(second.nextOffset).toBeUndefined();
      expect(new Set(ids).size).toBe(PAGE_SIZE + 1);
    });

    it('filters to one status when asked', async () => {
      const project = await makeProject(1);
      const wbsElementId = await projectWbsElementId(project.projectId);
      await makeTask(wbsElementId, 'In progress task');
      const doneTask = await makeTask(wbsElementId, 'Done task');
      await prisma.task.update({ where: { taskId: doneTask.taskId }, data: { status: Task_Status.DONE } });

      const { data } = await callTool('finishline_get_tasks', { wbsNum: '1.1.0', status: 'DONE' });

      expect(data.tasks.map((task: { title: string }) => task.title)).toEqual(['Done task']);
    });
  });

  describe('Get Events', () => {
    const createEvent = async (slots: { startTime: Date; endTime: Date }[]) => {
      const eventType = await prisma.event_Type.create({
        data: {
          name: 'Meeting',
          organizationId: orgId,
          userCreatedId: admin.userId,
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
          takeAttendance: false
        }
      });

      return prisma.event.create({
        data: {
          title: 'Weekly Sync',
          description: 'Team sync',
          userCreatedId: admin.userId,
          eventTypeId: eventType.eventTypeId,
          approved: Conflict_Status.APPROVED,
          status: Event_Status.SCHEDULED,
          scheduledTimes: { create: slots.map((slot) => ({ ...slot, allDay: false })) }
        }
      });
    };

    const slotOn = (day: string) => ({
      startTime: new Date(`${day}T10:00:00Z`),
      endTime: new Date(`${day}T11:00:00Z`)
    });

    const firstWeek = { startPeriod: '2026-09-01T00:00:00Z', endPeriod: '2026-09-07T23:59:59Z' };

    it('returns only the events in the period', async () => {
      await createEvent([slotOn('2026-09-07')]);
      await createEvent([slotOn('2026-09-20')]);

      const { data } = await callTool('finishline_get_events', firstWeek);

      expect(data).toHaveLength(1);
      expect(data[0].title).toBe('Weekly Sync');
    });

    it('returns only the occurrences of a recurring event inside the range', async () => {
      await createEvent([slotOn('2026-09-02'), slotOn('2026-09-09'), slotOn('2026-09-16')]);

      const { data } = await callTool('finishline_get_events', firstWeek);

      expect(data[0].scheduledTimes).toHaveLength(1);
      expect(data[0].numScheduledSlots).toBe(3);
    });

    it('filters by approval status', async () => {
      await createEvent([slotOn('2026-09-02')]);
      const pending = await createEvent([slotOn('2026-09-03')]);
      await prisma.event.update({ where: { eventId: pending.eventId }, data: { approved: Conflict_Status.PENDING } });

      const { data } = await callTool('finishline_get_events', { ...firstWeek, statuses: ['PENDING'] });

      expect(data.map((event: { eventId: string }) => event.eventId)).toEqual([pending.eventId]);
    });

    it('does not expose the id filters', async () => {
      const { tools } = await rpc('tools/list', {});
      const tool = tools.find((candidate: { name: string }) => candidate.name === 'finishline_get_events');

      expect(Object.keys(tool.inputSchema.properties).sort()).toEqual(['endPeriod', 'startPeriod', 'statuses']);
    });

    it('rejects an unparseable date before reaching the service', async () => {
      const { result } = await callTool('finishline_get_events', { ...firstWeek, startPeriod: 'next Monday' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('ISO date');
    });

    it('rejects an inverted range', async () => {
      const { result } = await callTool('finishline_get_events', {
        startPeriod: '2026-09-07T00:00:00Z',
        endPeriod: '2026-09-01T00:00:00Z'
      });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('after startPeriod');
    });
  });
});
