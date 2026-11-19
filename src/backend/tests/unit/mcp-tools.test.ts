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
import { batmanAppAdmin, greenlanternHead } from '../test-data/users.test-data.js';
import prisma from '../../src/prisma/prisma.js';
import ApiTokenService from '../../src/services/api-tokens.services.js';
import agentRouter from '../../src/routes/agent.routes.js';
import { mcpNodeHandler } from '../../src/mcp/handler.js';
import { attachAuthInfo, requireApiToken } from '../../src/utils/mcp-auth.utils.js';
import { errorHandler } from '../../src/utils/errors.utils.js';
import { AGENT_PAGE_SIZE } from '../../src/utils/agent.utils.js';

/**
 * Drives the agent APIs the way index.ts mounts them, authenticated with real API tokens: the MCP
 * tools through /mcp, and the matching REST routes through /agent. Both call the same services the
 * app does, so these cover what sits on top of them: tool registration, schema validation, the
 * newest car default, paging, the event range limit, and how failures reach the model.
 */
describe('Agent APIs', () => {
  let organization: Organization;
  let orgId: string;
  let admin: User;
  let head: User;
  let adminToken: string;
  let headToken: string;
  let carId: string;
  let app: express.Express;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    admin = await createTestUser(batmanAppAdmin, orgId);
    head = await createTestUser(greenlanternHead, orgId);
    adminToken = (await ApiTokenService.generateApiToken(admin, organization)).token;
    headToken = (await ApiTokenService.generateApiToken(head, organization)).token;
    ({ carId } = await createTestCar(orgId, admin.userId, 1));

    // mounted the way index.ts does: both authenticate with the API token themselves
    app = express();
    app.use(express.json());
    app.use('/agent', agentRouter);
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

  const agentGet = (path: string) => request(app).get(`/agent${path}`).set('x-api-key', adminToken);

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
      'finishline_create_team',
      'finishline_get_events',
      'finishline_get_project',
      'finishline_get_tasks',
      'finishline_list_projects'
    ]);
  });

  describe('List Projects', () => {
    it('defaults to the newest car', async () => {
      const newerCarId = (await createTestCar(orgId, admin.userId, 2)).carId;
      await makeProject(1);
      await makeProject(1, newerCarId, 2);

      const { data } = await callTool('finishline_list_projects', {});

      expect(data.carNumber).toBe(2);
      expect(data.projects.map((project: { wbsNum: object }) => project.wbsNum)).toEqual([
        { carNumber: 2, projectNumber: 1, workPackageNumber: 0 }
      ]);
    });

    it('lists only the requested car', async () => {
      const newerCarId = (await createTestCar(orgId, admin.userId, 2)).carId;
      await makeProject(1);
      await makeProject(1, newerCarId, 2);

      const { data } = await callTool('finishline_list_projects', { carNumber: 1 });

      expect(data.carNumber).toBe(1);
      expect(data.projects).toHaveLength(1);
      expect(data.projects[0].wbsNum.carNumber).toBe(1);
    });

    it('pages through a car with more projects than fit in one page', async () => {
      for (let projectNumber = 1; projectNumber <= AGENT_PAGE_SIZE + 1; projectNumber++) {
        await makeProject(projectNumber);
      }

      const { data: first } = await callTool('finishline_list_projects', {});
      const { data: second } = await callTool('finishline_list_projects', { offset: first.nextOffset });

      expect(first.total).toBe(AGENT_PAGE_SIZE + 1);
      expect(first.projects).toHaveLength(AGENT_PAGE_SIZE);
      expect(first.nextOffset).toBe(AGENT_PAGE_SIZE);
      expect(second.projects).toHaveLength(1);
      expect(second.nextOffset).toBeUndefined();
    });

    it('reports a car that does not exist', async () => {
      const { result } = await callTool('finishline_list_projects', { carNumber: 9 });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('no car 9');
    });

    it('is served the same way over /agent', async () => {
      await makeProject(1);

      const res = await agentGet('/projects');

      expect(res.status).toBe(200);
      expect(res.body.carNumber).toBe(1);
      expect(res.body.total).toBe(1);
    });

    it('rejects a malformed car number over /agent', async () => {
      expect((await agentGet('/projects?carNumber=abc')).status).toBe(400);
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
      expect(result.content[0].text).toContain('is a work package, not a project');
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

    it("serves the project's work packages over /agent", async () => {
      const project = await makeProject(1);
      await createTestWorkPackage(admin, orgId, project.projectId, 1, 1, 1);

      const res = await agentGet('/projects/1.1.0/work-packages');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('Get Tasks', () => {
    it('includes tasks on the project and on its work packages', async () => {
      const project = await makeProject(1);
      const workPackage = await createTestWorkPackage(admin, orgId, project.projectId, 1, 1, 1);
      await makeTask(await projectWbsElementId(project.projectId), 'Project task');
      await makeTask(workPackage.wbsElementId, 'Work package task');

      const { data } = await callTool('finishline_get_tasks', { wbsNum: '1.1.0' });

      expect(data.total).toBe(2);
      expect(data.nextOffset).toBeUndefined();
      expect(data.tasks.map((task: { title: string }) => task.title).sort()).toEqual(['Project task', 'Work package task']);
    });

    it('pages through every task exactly once', async () => {
      const project = await makeProject(1);
      const wbsElementId = await projectWbsElementId(project.projectId);
      for (let i = 0; i < AGENT_PAGE_SIZE + 1; i++) await makeTask(wbsElementId, `Task ${i}`);

      const { data: first } = await callTool('finishline_get_tasks', { wbsNum: '1.1.0' });
      const { data: second } = await callTool('finishline_get_tasks', { wbsNum: '1.1.0', offset: first.nextOffset });

      const ids = [...first.tasks, ...second.tasks].map((task: { taskId: string }) => task.taskId);
      expect(first.tasks).toHaveLength(AGENT_PAGE_SIZE);
      expect(second.nextOffset).toBeUndefined();
      expect(new Set(ids).size).toBe(AGENT_PAGE_SIZE + 1);
    });

    it('is served the same way over /agent', async () => {
      const project = await makeProject(1);
      await makeTask(await projectWbsElementId(project.projectId), 'Project task');

      const res = await agentGet('/projects/1.1.0/tasks');

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
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

    it('returns events in the range, including ones on the final day', async () => {
      await createEvent([slotOn('2026-09-07')]);
      await createEvent([slotOn('2026-09-20')]);

      const { data } = await callTool('finishline_get_events', { startDate: '2026-09-01', endDate: '2026-09-07' });

      expect(data).toHaveLength(1);
      expect(data[0].title).toBe('Weekly Sync');
    });

    it('returns only the occurrences of a recurring event inside the range', async () => {
      await createEvent([slotOn('2026-09-02'), slotOn('2026-09-09'), slotOn('2026-09-16')]);

      const { data } = await callTool('finishline_get_events', { startDate: '2026-09-01', endDate: '2026-09-07' });

      expect(data[0].scheduledTimes).toHaveLength(1);
      expect(data[0].numScheduledSlots).toBe(3);
    });

    it('rejects a range wider than a week with a hint', async () => {
      const { result } = await callTool('finishline_get_events', { startDate: '2026-09-01', endDate: '2026-09-09' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('7 days or fewer');
      expect(result.content[0].text).toContain('one week at a time');
    });

    it('rejects an inverted range', async () => {
      const { result } = await callTool('finishline_get_events', { startDate: '2026-09-07', endDate: '2026-09-01' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('on or after startDate');
    });

    it('rejects a range wider than a week over /agent', async () => {
      expect((await agentGet('/events?startDate=2026-09-01&endDate=2026-09-09')).status).toBe(400);
    });
  });

  describe('Create Team', () => {
    const validTeam = () => ({
      teamName: 'Software',
      headId: head.userId,
      slackId: 'C0123456789',
      description: 'Builds FinishLine',
      isFinanceTeam: false
    });

    const teamCount = () => prisma.team.count({ where: { organizationId: orgId } });

    it('is listed as a write tool with its field descriptions', async () => {
      const { tools } = await rpc('tools/list', {});
      const tool = tools.find((candidate: { name: string }) => candidate.name === 'finishline_create_team');

      expect(tool.annotations).toEqual({ readOnlyHint: false, destructiveHint: false });
      expect(tool.inputSchema.required.sort()).toEqual(['description', 'headId', 'isFinanceTeam', 'slackId', 'teamName']);
      expect(tool.inputSchema.properties.slackId.description).toContain('Slack channel id');
    });

    it('creates a team through the teams service', async () => {
      const { data } = await callTool('finishline_create_team', validTeam());

      expect(data.teamName).toBe('Software');
      expect(await teamCount()).toBe(1);
    });

    it('rejects a slack channel name before reaching the service', async () => {
      const { result } = await callTool('finishline_create_team', { ...validTeam(), slackId: '#software' });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('slackId');
      expect(await teamCount()).toBe(0);
    });

    it("applies the service's admin check to the token's user", async () => {
      const { result } = await callTool('finishline_create_team', validTeam(), headToken);

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('must be an admin');
      expect(await teamCount()).toBe(0);
    });

    it('reports a service failure with the recovery hint', async () => {
      await callTool('finishline_create_team', validTeam());
      const { result } = await callTool('finishline_create_team', validTeam());

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain('must not be the name of another team');
      expect(result.content[0].text).toContain('Check that the head id');
    });
  });
});
