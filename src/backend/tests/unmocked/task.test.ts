import { financeMember, flashAdmin, member, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data.js';
import {
  AccessDeniedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException,
  DeletedException
} from '../../src/utils/errors.utils.js';
import {
  createTestOrganization,
  createTestTask,
  createTestTaskWithOrganization,
  createTestUser,
  resetUsers,
  createTestCar,
  createTestProject,
  createTestWorkPackage,
  createTestTeamType,
  createTestTaskLabel
} from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import TasksService from '../../src/services/tasks.services.js';
import { WbsNumber } from 'shared';
import { Organization } from '@prisma/client';

describe('Task Tests', () => {
  let organizationId: string;
  let organization: Organization;

  beforeEach(async () => {
    organization = await createTestOrganization();
    ({ organizationId } = organization);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Edit task', () => {
    it('successfully updates wbs element when wbsNum is provided', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      const newWbsElement = await prisma.wBS_Element.create({
        data: {
          name: 'New WBS',
          status: 'INACTIVE',
          carNumber: 1,
          projectNumber: 1,
          workPackageNumber: 0,
          dateCreated: new Date('01/01/2023'),
          leadId: user.userId,
          managerId: user.userId,
          organizationId
        }
      });

      const newWbsNum: WbsNumber = {
        carNumber: newWbsElement.carNumber,
        projectNumber: newWbsElement.projectNumber,
        workPackageNumber: newWbsElement.workPackageNumber
      };

      await TasksService.editTask(
        user,
        organizationId,
        task.taskId,
        'Test Task',
        '',
        'HIGH',
        [],
        [],
        undefined,
        undefined,
        newWbsNum
      );

      const updatedTask = await prisma.task.findUnique({
        where: { taskId: task.taskId },
        select: { taskId: true, wbsElement: { select: { carNumber: true, projectNumber: true, workPackageNumber: true } } }
      });
      expect(updatedTask?.taskId).toBe(task.taskId);
      expect(updatedTask?.wbsElement).toBeDefined();
    });

    it('does not update wbs element when wbsNum is not provided', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      await TasksService.editTask(user, organizationId, task.taskId, 'Updated Title', '', 'HIGH', [], []);

      const updatedTask = await prisma.task.findUnique({
        where: { taskId: task.taskId },
        select: { taskId: true, title: true }
      });
      expect(updatedTask?.taskId).toBe(task.taskId);
      expect(updatedTask?.title).toBe('Updated Title');
    });

    it('throws NotFoundException when wbsNum does not exist', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      const nonExistentWbsNum: WbsNumber = { carNumber: 99, projectNumber: 99, workPackageNumber: 99 };

      await expect(async () =>
        TasksService.editTask(
          user,
          organizationId,
          task.taskId,
          'Test Task',
          '',
          'HIGH',
          [],
          [],
          undefined,
          undefined,
          nonExistentWbsNum
        )
      ).rejects.toThrow(NotFoundException);
    });

    it('throws DeletedException when wbsNum is deleted', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      const deletedWbsElement = await prisma.wBS_Element.create({
        data: {
          name: 'Deleted WBS',
          status: 'INACTIVE',
          carNumber: 99,
          projectNumber: 99,
          workPackageNumber: 0,
          dateCreated: new Date('01/01/2023'),
          leadId: user.userId,
          managerId: user.userId,
          organizationId,
          dateDeleted: new Date()
        }
      });

      const deletedWbsNum: WbsNumber = {
        carNumber: deletedWbsElement.carNumber,
        projectNumber: deletedWbsElement.projectNumber,
        workPackageNumber: deletedWbsElement.workPackageNumber
      };

      await expect(async () =>
        TasksService.editTask(
          user,
          organizationId,
          task.taskId,
          'Test Task',
          '',
          'HIGH',
          [],
          [],
          undefined,
          undefined,
          deletedWbsNum
        )
      ).rejects.toThrow(DeletedException);
    });

    it('successfully sets labels on a task', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);
      const label = await createTestTaskLabel(user, organizationId, 'Test Label', '#3B82F6');

      await TasksService.editTask(user, organizationId, task.taskId, 'Test Task', '', 'HIGH', [label.taskLabelId], []);

      const updatedTask = await prisma.task.findUnique({
        where: { taskId: task.taskId },
        select: { labels: { select: { taskLabelId: true } } }
      });
      expect(updatedTask?.labels).toHaveLength(1);
      expect(updatedTask?.labels[0].taskLabelId).toBe(label.taskLabelId);
    });

    it('throws NotFoundException when a label id does not exist', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      await expect(async () =>
        TasksService.editTask(user, organizationId, task.taskId, 'Test Task', '', 'HIGH', ['nonexistent-label-id'], [])
      ).rejects.toThrow(NotFoundException);
    });

    it('throws DeletedException when a label is deleted', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);
      const label = await createTestTaskLabel(user, organizationId, 'Test Label', '#3B82F6');
      await prisma.task_Label.update({ where: { taskLabelId: label.taskLabelId }, data: { dateDeleted: new Date() } });

      await expect(async () =>
        TasksService.editTask(user, organizationId, task.taskId, 'Test Task', '', 'HIGH', [label.taskLabelId], [])
      ).rejects.toThrow(DeletedException);
    });

    it('throws InvalidOrganizationException when a label belongs to a different organization', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);
      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Org',
          userCreated: { connect: { userId: user.userId } }
        }
      });
      const otherUser = await createTestUser(flashAdmin, otherOrg.organizationId);
      const label = await createTestTaskLabel(otherUser, otherOrg.organizationId, 'Test Label', '#3B82F6');

      await expect(async () =>
        TasksService.editTask(user, organizationId, task.taskId, 'Test Task', '', 'HIGH', [label.taskLabelId], [])
      ).rejects.toThrow(InvalidOrganizationException);
    });

    it('fails to edit blockedBy when it would create a circular blocking dependency', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const taskA = await createTestTask(user, 'Task A', '', [], 'HIGH', 'IN_BACKLOG', organizationId);
      const taskB = await prisma.task.create({
        data: {
          title: 'Task B',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: taskA.wbsElementId } },
          blockedBy: { connect: { taskId: taskA.taskId } }
        }
      });

      // Task B is already blockedBy Task A; making Task A blockedBy Task B would close the cycle
      await expect(async () =>
        TasksService.editTask(user, organizationId, taskA.taskId, taskA.title, '', 'HIGH', [], [taskB.taskId])
      ).rejects.toThrow(new HttpException(400, 'This would create a circular blocking dependency'));
    });
  });

  describe('Create task', () => {
    it('fails to create a task as done when blocked by an incomplete task', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const { task: blockerTask, organization: org } = await createTestTaskWithOrganization(user, organization);

      await expect(async () =>
        TasksService.createTask(
          user,
          { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
          'New Task',
          '',
          'HIGH',
          'DONE',
          [],
          org,
          [],
          [blockerTask.taskId]
        )
      ).rejects.toThrow(new HttpException(400, `Cannot create task as done: blocked by ${blockerTask.title}`));
    });

    it('does not let guests create tasks', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      // sets up project 0.1.0 with a team, so validation gets as far as the guest check
      const { organization: org } = await createTestTaskWithOrganization(admin, organization);
      const guest = await createTestUser(theVisitorGuest, organizationId);

      await expect(async () =>
        TasksService.createTask(
          guest,
          { carNumber: 0, projectNumber: 1, workPackageNumber: 0 },
          'New Task',
          '',
          'HIGH',
          'IN_BACKLOG',
          [],
          org,
          [],
          []
        )
      ).rejects.toThrow(new AccessDeniedException('Guests cannot create tasks'));
    });
  });

  describe('Edit task assignees', () => {
    it('throws InvalidOrganizationException when the task belongs to a different organization', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Org',
          userCreated: { connect: { userId: user.userId } }
        }
      });
      const otherUser = await createTestUser(flashAdmin, otherOrg.organizationId);
      const otherOrgTask = await createTestTask(
        otherUser,
        'Test Task',
        '',
        [],
        'HIGH',
        'IN_BACKLOG',
        otherOrg.organizationId
      );

      await expect(async () =>
        TasksService.editTaskAssignees(user, otherOrgTask.taskId, [user.userId], organization)
      ).rejects.toThrow(new InvalidOrganizationException('Task'));
    });
  });

  describe('Get overdue tasks by team leadership', () => {
    it("returns every overdue, unfinished task on the user's teams' projects and work packages", async () => {
      const head = await createTestUser(supermanAdmin, organizationId);
      const teamMember = await createTestUser(member, organizationId);
      const teamType = await createTestTeamType('aTeam', organizationId);
      const team = await prisma.team.create({
        data: {
          teamName: 'Overdue Team',
          slackId: 'aSlackId',
          description: 'aDescription',
          financeTeam: false,
          headId: head.userId,
          teamTypeId: teamType.teamTypeId,
          organizationId
        }
      });
      const project = await createTestProject(head, organizationId, team.teamId);
      const workPackage = await createTestWorkPackage(head, organizationId, project.projectId);

      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const createTask = (title: string, wbsElementId: string, status: 'IN_PROGRESS' | 'DONE', deadline: Date) =>
        prisma.task.create({
          data: {
            title,
            notes: '',
            priority: 'HIGH',
            status,
            deadline,
            dateCreated: new Date(),
            createdBy: { connect: { userId: head.userId } },
            // assigned to a member rather than the head, who must still see it
            assignees: { connect: { userId: teamMember.userId } },
            wbsElement: { connect: { wbsElementId } }
          }
        });

      const projectTask = await createTask('Project task', project.wbsElementId, 'IN_PROGRESS', yesterday);
      const workPackageTask = await createTask('WP task', workPackage.wbsElementId, 'IN_PROGRESS', yesterday);
      await createTask('Done task', project.wbsElementId, 'DONE', yesterday);
      await createTask('Future task', project.wbsElementId, 'IN_PROGRESS', nextWeek);

      const overdueTasks = await TasksService.getOverdueTasksByTeamLeadership(head.userId, organization);

      expect(overdueTasks.map((task) => task.taskId).sort()).toEqual([projectTask.taskId, workPackageTask.taskId].sort());
      overdueTasks.forEach((task) => expect(task.projectName).toBe('Genesis'));
    });
  });

  describe('Edit task status', () => {
    it('successfully sets status to in progress when task has deadline and assignees', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const correctTask = await createTestTask(
        user,
        'Test',
        '',
        [user],
        'HIGH',
        'IN_BACKLOG',
        organizationId,
        new Date('01/23/2023')
      );
      await TasksService.editTaskStatus(user, organizationId, correctTask.taskId, 'IN_PROGRESS');
      const updatedTask = await prisma.task.findUnique({
        where: {
          taskId: correctTask.taskId
        }
      });
      expect(updatedTask?.status).toBe('IN_PROGRESS');
    });

    it('fails to set status to in progress when task does not have a deadline and assignees', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const badTask = await createTestTask(user, 'Test', '', [], 'HIGH', 'DONE', organizationId);
      await expect(async () =>
        TasksService.editTaskStatus(
          await createTestUser(financeMember, organizationId),
          organizationId,
          badTask.taskId,
          'IN_PROGRESS'
        )
      ).rejects.toThrow(new HttpException(400, 'A task in progress must have a deadline and assignees!'));
    });

    it('fails to set status to in progress when task does not have a deadline, but does have assignees', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const badTask = await createTestTask(user, 'Test', '', [user], 'HIGH', 'IN_BACKLOG', organizationId);
      await expect(async () =>
        TasksService.editTaskStatus(
          await createTestUser(financeMember, organizationId),
          organizationId,
          badTask.taskId,
          'IN_PROGRESS'
        )
      ).rejects.toThrow(new HttpException(400, 'A task in progress must have a deadline and assignees!'));
    });

    it('fails to set status to in progress when task does not have assignees, but does have a deadline', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const badTask = await createTestTask(user, 'Test', '', [], 'HIGH', 'DONE', organizationId, new Date());
      await expect(async () =>
        TasksService.editTaskStatus(
          await createTestUser(financeMember, organizationId),
          organizationId,
          badTask.taskId,
          'IN_PROGRESS'
        )
      ).rejects.toThrow(new HttpException(400, 'A task in progress must have a deadline and assignees!'));
    });

    it('sets status to done even when blocked by an incomplete task (block is advisory, frontend confirms)', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const blockerTask = await createTestTask(user, 'Blocker', '', [], 'HIGH', 'IN_PROGRESS', organizationId);
      const blockedTask = await prisma.task.create({
        data: {
          title: 'Blocked',
          notes: '',
          priority: 'HIGH',
          status: 'IN_PROGRESS',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: blockerTask.wbsElementId } },
          blockedBy: { connect: { taskId: blockerTask.taskId } }
        }
      });

      await TasksService.editTaskStatus(user, organizationId, blockedTask.taskId, 'DONE');
      const updatedTask = await prisma.task.findUnique({ where: { taskId: blockedTask.taskId } });
      expect(updatedTask?.status).toBe('DONE');
    });

    it('successfully sets status to done when all blocking tasks are already done', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const blockerTask = await createTestTask(user, 'Blocker', '', [], 'HIGH', 'DONE', organizationId);
      const blockedTask = await prisma.task.create({
        data: {
          title: 'Blocked',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: blockerTask.wbsElementId } },
          blockedBy: { connect: { taskId: blockerTask.taskId } }
        }
      });

      await TasksService.editTaskStatus(user, organizationId, blockedTask.taskId, 'DONE');
      const updatedTask = await prisma.task.findUnique({ where: { taskId: blockedTask.taskId } });
      expect(updatedTask?.status).toBe('DONE');
    });

    it('sets status to done even when the work package is blocked by a work package with incomplete tasks', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId);
      const project = await createTestProject(user, organizationId, undefined, car.carId);
      const wpA = await createTestWorkPackage(user, organizationId, project.projectId, 0, 1, 1);
      const wpB = await createTestWorkPackage(user, organizationId, project.projectId, 0, 1, 2);

      await prisma.work_Package.update({
        where: { workPackageId: wpB.workPackageId },
        data: { blockedBy: { connect: { wbsElementId: wpA.wbsElement.wbsElementId } } }
      });

      // wpA still has an incomplete task, so it still counts as actively blocking
      await prisma.task.create({
        data: {
          title: 'WP A task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: wpA.wbsElementId } }
        }
      });

      const taskInWpB = await prisma.task.create({
        data: {
          title: 'WP B task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: wpB.wbsElementId } }
        }
      });

      await TasksService.editTaskStatus(user, organizationId, taskInWpB.taskId, 'DONE');
      const updatedTask = await prisma.task.findUnique({ where: { taskId: taskInWpB.taskId } });
      expect(updatedTask?.status).toBe('DONE');
    });

    it('successfully sets status to done when the only blocking task has been deleted', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const blockerTask = await createTestTask(user, 'Blocker', '', [], 'HIGH', 'IN_PROGRESS', organizationId);
      const blockedTask = await prisma.task.create({
        data: {
          title: 'Blocked',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: blockerTask.wbsElementId } },
          blockedBy: { connect: { taskId: blockerTask.taskId } }
        }
      });

      await prisma.task.update({
        where: { taskId: blockerTask.taskId },
        data: { dateDeleted: new Date(), deletedByUserId: user.userId }
      });

      await TasksService.editTaskStatus(user, organizationId, blockedTask.taskId, 'DONE');
      const updatedTask = await prisma.task.findUnique({ where: { taskId: blockedTask.taskId } });
      expect(updatedTask?.status).toBe('DONE');
    });
  });

  describe('Get filtered tasks page', () => {
    it("pages one status column in the board's order: soonest deadline first, none last, then highest priority", async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const project = await createTestProject(user, organizationId);
      const day = (n: number) => new Date(Date.UTC(2030, 0, n));

      // 21 backlog tasks (these plus 'Earliest high' below): one more than a page. Within a deadline, HIGH sorts first
      const backlogTasks = [
        ...Array.from({ length: 18 }, (_, i) => ({ title: `Dated ${i}`, priority: 'LOW' as const, deadline: day(i + 2) })),
        { title: 'Earliest low', priority: 'LOW' as const, deadline: day(1) },
        { title: 'Undated', priority: 'HIGH' as const, deadline: null }
      ];
      await prisma.task.createMany({
        data: [
          ...backlogTasks.map((task) => ({
            ...task,
            notes: '',
            status: 'IN_BACKLOG' as const,
            createdByUserId: user.userId,
            wbsElementId: project.wbsElementId
          })),
          {
            title: 'Earliest high',
            notes: '',
            priority: 'HIGH',
            status: 'IN_BACKLOG',
            deadline: day(1),
            createdByUserId: user.userId,
            wbsElementId: project.wbsElementId
          },
          // other columns never show up in this one
          {
            title: 'In progress',
            notes: '',
            priority: 'HIGH',
            status: 'IN_PROGRESS',
            deadline: day(1),
            createdByUserId: user.userId,
            wbsElementId: project.wbsElementId
          }
        ]
      });

      const firstPage = await TasksService.getFilteredTasksPage({}, 'IN_BACKLOG', 0, organization);
      const secondPage = await TasksService.getFilteredTasksPage({}, 'IN_BACKLOG', 20, organization);

      expect(firstPage.tasks).toHaveLength(20);
      expect(firstPage.nextOffset).toBe(20);
      expect(firstPage.tasks.slice(0, 3).map((task) => task.title)).toEqual(['Earliest high', 'Earliest low', 'Dated 0']);
      expect(secondPage.tasks.map((task) => task.title)).toEqual(['Undated']);
      expect(secondPage.nextOffset).toBeUndefined();
      const allTitles = [...firstPage.tasks, ...secondPage.tasks].map((task) => task.title);
      expect(new Set(allTitles).size).toBe(21);
      expect(allTitles).not.toContain('In progress');
    });

    it('applies the same filters as the full filter endpoint', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const project = await createTestProject(user, organizationId);
      await prisma.task.createMany({
        data: ['Wire the harness', 'Order bolts'].map((title) => ({
          title,
          notes: '',
          priority: 'HIGH' as const,
          status: 'IN_BACKLOG' as const,
          createdByUserId: user.userId,
          wbsElementId: project.wbsElementId
        }))
      });

      const page = await TasksService.getFilteredTasksPage({ search: 'HARNESS' }, 'IN_BACKLOG', 0, organization);

      expect(page.tasks.map((task) => task.title)).toEqual(['Wire the harness']);
      expect(page.nextOffset).toBeUndefined();
    });
  });

  describe('Get filtered tasks', () => {
    it('returns project tasks and all WP tasks when given a project wbs number', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId);
      const project = await createTestProject(user, organizationId, undefined, car.carId);

      await prisma.task.create({
        data: {
          title: 'Project Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: project.wbsElementId } }
        }
      });

      const wp = await prisma.work_Package.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 0,
              projectNumber: 1,
              workPackageNumber: 1,
              dateCreated: new Date(),
              name: 'WP 1',
              status: 'INACTIVE',
              leadId: user.userId,
              managerId: user.userId,
              organizationId
            }
          },
          project: { connect: { projectId: project.projectId } },
          orderInProject: 1,
          startDate: new Date(),
          duration: 2
        }
      });

      await prisma.task.create({
        data: {
          title: 'WP Task',
          notes: '',
          priority: 'LOW',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: wp.wbsElementId } }
        }
      });

      const tasks = await TasksService.getFilteredTasks(
        { wbsNum: { carNumber: 0, projectNumber: 1, workPackageNumber: 0 } },
        organization
      );

      expect(tasks.length).toBe(2);
      expect(tasks.map((t) => t.title)).toContain('Project Task');
      expect(tasks.map((t) => t.title)).toContain('WP Task');
    });

    it('returns only WP tasks when given a WP wbs number', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId);
      const project = await createTestProject(user, organizationId, undefined, car.carId);

      const wp = await prisma.work_Package.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 0,
              projectNumber: 1,
              workPackageNumber: 1,
              dateCreated: new Date(),
              name: 'WP 1',
              status: 'INACTIVE',
              leadId: user.userId,
              managerId: user.userId,
              organizationId
            }
          },
          project: { connect: { projectId: project.projectId } },
          orderInProject: 1,
          startDate: new Date(),
          duration: 2
        }
      });

      await prisma.task.create({
        data: {
          title: 'WP Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: wp.wbsElementId } }
        }
      });

      const tasks = await TasksService.getFilteredTasks(
        { wbsNum: { carNumber: 0, projectNumber: 1, workPackageNumber: 1 } },
        organization
      );

      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('WP Task');
    });

    it('throws NotFoundException when wbs element does not exist', async () => {
      await expect(async () =>
        TasksService.getFilteredTasks({ wbsNum: { carNumber: 99, projectNumber: 99, workPackageNumber: 0 } }, organization)
      ).rejects.toThrow(NotFoundException);
    });

    it('throws DeletedException when wbs element is deleted', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      await prisma.wBS_Element.create({
        data: {
          carNumber: 99,
          projectNumber: 99,
          workPackageNumber: 0,
          dateCreated: new Date(),
          name: 'Deleted WBS',
          status: 'INACTIVE',
          leadId: user.userId,
          managerId: user.userId,
          organizationId,
          dateDeleted: new Date()
        }
      });

      await expect(async () =>
        TasksService.getFilteredTasks({ wbsNum: { carNumber: 99, projectNumber: 99, workPackageNumber: 0 } }, organization)
      ).rejects.toThrow(DeletedException);
    });

    it('filters tasks by labelIds when wbsNum is provided', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId);
      const project = await createTestProject(user, organizationId, undefined, car.carId);
      const label = await createTestTaskLabel(user, organizationId, 'Bug', '#EF4444');

      await prisma.task.create({
        data: {
          title: 'Labeled Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: project.wbsElementId } },
          labels: { connect: [{ taskLabelId: label.taskLabelId }] }
        }
      });

      await prisma.task.create({
        data: {
          title: 'Unlabeled Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: project.wbsElementId } }
        }
      });

      const tasks = await TasksService.getFilteredTasks(
        { wbsNum: { carNumber: 0, projectNumber: 1, workPackageNumber: 0 }, labelIds: [label.taskLabelId] },
        organization
      );

      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Labeled Task');
    });

    it('returns all org tasks when no filters are provided', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId);
      const project = await createTestProject(user, organizationId, undefined, car.carId);

      await prisma.task.create({
        data: {
          title: 'Task 1',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: project.wbsElementId } }
        }
      });

      await prisma.task.create({
        data: {
          title: 'Task 2',
          notes: '',
          priority: 'LOW',
          status: 'DONE',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: project.wbsElementId } }
        }
      });

      const tasks = await TasksService.getFilteredTasks({}, organization);

      expect(tasks.length).toBe(2);
      expect(tasks.map((t) => t.title)).toContain('Task 1');
      expect(tasks.map((t) => t.title)).toContain('Task 2');
    });

    it('filters tasks by carNumbers, OR-ing within the filter', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car1 = await createTestCar(organizationId, user.userId, 1);
      const car2 = await createTestCar(organizationId, user.userId, 2);
      const projectA = await createTestProject(user, organizationId, undefined, car1.carId, 1, 1);
      const projectB = await createTestProject(user, organizationId, undefined, car2.carId, 2, 1);

      await prisma.task.create({
        data: {
          title: 'Car1 Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: projectA.wbsElementId } }
        }
      });
      await prisma.task.create({
        data: {
          title: 'Car2 Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: projectB.wbsElementId } }
        }
      });

      const both = await TasksService.getFilteredTasks({ carNumbers: [1, 2] }, organization);
      expect(both.map((t) => t.title).sort()).toEqual(['Car1 Task', 'Car2 Task']);

      const onlyCar1 = await TasksService.getFilteredTasks({ carNumbers: [1] }, organization);
      expect(onlyCar1.map((t) => t.title)).toEqual(['Car1 Task']);
    });

    it('filters tasks by projectWbsNums, OR-ing within the filter', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId, 1);
      const projectA = await createTestProject(user, organizationId, undefined, car.carId, 1, 1);
      const projectB = await createTestProject(user, organizationId, undefined, car.carId, 1, 2);

      await prisma.task.create({
        data: {
          title: 'Project A Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: projectA.wbsElementId } }
        }
      });
      await prisma.task.create({
        data: {
          title: 'Project B Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: projectB.wbsElementId } }
        }
      });

      const both = await TasksService.getFilteredTasks(
        {
          projectWbsNums: [
            { carNumber: 1, projectNumber: 1, workPackageNumber: 0 },
            { carNumber: 1, projectNumber: 2, workPackageNumber: 0 }
          ]
        },
        organization
      );
      expect(both.map((t) => t.title).sort()).toEqual(['Project A Task', 'Project B Task']);

      const onlyA = await TasksService.getFilteredTasks(
        { projectWbsNums: [{ carNumber: 1, projectNumber: 1, workPackageNumber: 0 }] },
        organization
      );
      expect(onlyA.map((t) => t.title)).toEqual(['Project A Task']);
    });

    it('AND-s the project and team filters when andMemberTeam is set', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId, 1);
      const team = await prisma.team.create({
        data: { teamName: 'Team X', slackId: 'slack-x', description: '', headId: user.userId, organizationId }
      });
      const projectA = await createTestProject(user, organizationId, team.teamId, car.carId, 1, 1);
      const projectB = await createTestProject(user, organizationId, undefined, car.carId, 1, 2);

      await prisma.task.create({
        data: {
          title: 'Team Project Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: projectA.wbsElementId } }
        }
      });
      await prisma.task.create({
        data: {
          title: 'Other Project Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: projectB.wbsElementId } }
        }
      });

      const tasks = await TasksService.getFilteredTasks(
        {
          projectWbsNums: [
            { carNumber: 1, projectNumber: 1, workPackageNumber: 0 },
            { carNumber: 1, projectNumber: 2, workPackageNumber: 0 }
          ],
          teamIds: [team.teamId],
          andMemberTeam: true
        },
        organization
      );

      expect(tasks.map((t) => t.title)).toEqual(['Team Project Task']);
    });

    it('matches work package tasks via their parent project team when andMemberTeam is set', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId, 1);
      const team = await prisma.team.create({
        data: { teamName: 'Team Y', slackId: 'slack-y', description: '', headId: user.userId, organizationId }
      });
      // projectA belongs to the team, projectB does not
      const projectA = await createTestProject(user, organizationId, team.teamId, car.carId, 1, 1);
      const projectB = await createTestProject(user, organizationId, undefined, car.carId, 1, 2);

      const wpA = await prisma.work_Package.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 1,
              projectNumber: 1,
              workPackageNumber: 1,
              dateCreated: new Date(),
              name: 'Team WP',
              status: 'INACTIVE',
              leadId: user.userId,
              managerId: user.userId,
              organizationId
            }
          },
          project: { connect: { projectId: projectA.projectId } },
          orderInProject: 1,
          startDate: new Date(),
          duration: 2
        }
      });
      const wpB = await prisma.work_Package.create({
        data: {
          wbsElement: {
            create: {
              carNumber: 1,
              projectNumber: 2,
              workPackageNumber: 1,
              dateCreated: new Date(),
              name: 'Other WP',
              status: 'INACTIVE',
              leadId: user.userId,
              managerId: user.userId,
              organizationId
            }
          },
          project: { connect: { projectId: projectB.projectId } },
          orderInProject: 1,
          startDate: new Date(),
          duration: 2
        }
      });

      await prisma.task.create({
        data: {
          title: 'Team WP Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: wpA.wbsElementId } }
        }
      });
      await prisma.task.create({
        data: {
          title: 'Other WP Task',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: wpB.wbsElementId } }
        }
      });

      const tasks = await TasksService.getFilteredTasks({ teamIds: [team.teamId], andMemberTeam: true }, organization);

      expect(tasks.map((t) => t.title)).toEqual(['Team WP Task']);
    });

    it('filters tasks by a fuzzy search over title and notes', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId, 1);
      const project = await createTestProject(user, organizationId, undefined, car.carId, 1, 1);

      await prisma.task.create({
        data: {
          title: 'Fix Brakes',
          notes: '',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: project.wbsElementId } }
        }
      });
      await prisma.task.create({
        data: {
          title: 'Other Work',
          notes: 'needs suspension tuning',
          priority: 'HIGH',
          status: 'IN_BACKLOG',
          dateCreated: new Date(),
          createdBy: { connect: { userId: user.userId } },
          wbsElement: { connect: { wbsElementId: project.wbsElementId } }
        }
      });

      const byTitle = await TasksService.getFilteredTasks({ search: 'brake' }, organization);
      expect(byTitle.map((t) => t.title)).toEqual(['Fix Brakes']);

      const byNotes = await TasksService.getFilteredTasks({ search: 'suspension' }, organization);
      expect(byNotes.map((t) => t.title)).toEqual(['Other Work']);
    });
  });

  describe('Guest editing permissions', () => {
    it('does not let guests edit tasks', async () => {
      const guest = await createTestUser(theVisitorGuest, organizationId);
      const admin = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(admin, 'Test', '', [], 'HIGH', 'DONE', organizationId, new Date());
      await expect(async () =>
        TasksService.editTask(guest, organizationId, task.taskId, 'Title', 'Notes', 'HIGH', [], [], new Date())
      ).rejects.toThrow(new AccessDeniedException('Guests cannot edit tasks'));
    });
  });

  describe('Create task label', () => {
    it('successfully creates a task label as admin', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });

      await TasksService.createTaskLabel(admin, 'Bug', '#EF4444', organization);

      const label = await prisma.task_Label.findFirst({
        where: { organizationId, name: 'Bug' },
        select: { colorHexCode: true }
      });
      expect(label?.colorHexCode).toBe('#EF4444');
    });

    it('throws AccessDeniedException when non-admin tries to create a task label', async () => {
      const member = await createTestUser(financeMember, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });

      await expect(async () => TasksService.createTaskLabel(member, 'Bug', '#EF4444', organization)).rejects.toThrow(
        new AccessDeniedException('Non admins cannot create task labels')
      );
    });
  });

  describe('Edit task label', () => {
    it('successfully edits a task label as admin', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const label = await createTestTaskLabel(admin, organizationId, 'Test Label', '#3B82F6');

      await TasksService.editTaskLabel(admin, label.taskLabelId, 'New Name', '#22C55E', organization);

      const updated = await prisma.task_Label.findUnique({
        where: { taskLabelId: label.taskLabelId },
        select: { name: true, colorHexCode: true }
      });
      expect(updated?.name).toBe('New Name');
      expect(updated?.colorHexCode).toBe('#22C55E');
    });

    it('throws AccessDeniedException when non-admin tries to edit a task label', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const member = await createTestUser(financeMember, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const label = await createTestTaskLabel(admin, organizationId, 'Test Label', '#3B82F6');

      await expect(async () =>
        TasksService.editTaskLabel(member, label.taskLabelId, 'New Name', '#22C55E', organization)
      ).rejects.toThrow(AccessDeniedException);
    });

    it('throws NotFoundException when label does not exist', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });

      await expect(async () =>
        TasksService.editTaskLabel(admin, 'nonexistent-id', 'New Name', '#22C55E', organization)
      ).rejects.toThrow(NotFoundException);
    });

    it('throws DeletedException when label is already deleted', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const label = await createTestTaskLabel(admin, organizationId, 'Test Label', '#3B82F6');
      await prisma.task_Label.update({ where: { taskLabelId: label.taskLabelId }, data: { dateDeleted: new Date() } });

      await expect(async () =>
        TasksService.editTaskLabel(admin, label.taskLabelId, 'New Name', '#22C55E', organization)
      ).rejects.toThrow(DeletedException);
    });

    it('throws InvalidOrganizationException when label belongs to a different organization', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Org',
          userCreated: { connect: { userId: admin.userId } }
        }
      });
      const otherUser = await createTestUser(flashAdmin, otherOrg.organizationId);
      const label = await createTestTaskLabel(otherUser, otherOrg.organizationId, 'Test Label', '#3B82F6');

      await expect(async () =>
        TasksService.editTaskLabel(admin, label.taskLabelId, 'New Name', '#22C55E', organization)
      ).rejects.toThrow(InvalidOrganizationException);
    });
  });

  describe('Delete task label', () => {
    it('successfully deletes a task label as admin', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const label = await createTestTaskLabel(admin, organizationId, 'Test Label', '#3B82F6');

      await TasksService.deleteTaskLabel(admin, label.taskLabelId, organization);

      const inDb = await prisma.task_Label.findUnique({
        where: { taskLabelId: label.taskLabelId },
        select: { taskLabelId: true, dateDeleted: true }
      });
      expect(inDb?.taskLabelId).toBe(label.taskLabelId);
      expect(inDb?.dateDeleted).not.toBeNull();
    });

    it('throws AccessDeniedException when non-admin tries to delete a task label', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const member = await createTestUser(financeMember, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const label = await createTestTaskLabel(admin, organizationId, 'Test Label', '#3B82F6');

      await expect(async () => TasksService.deleteTaskLabel(member, label.taskLabelId, organization)).rejects.toThrow(
        AccessDeniedException
      );
    });

    it('throws NotFoundException when label does not exist', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });

      await expect(async () => TasksService.deleteTaskLabel(admin, 'nonexistent-id', organization)).rejects.toThrow(
        NotFoundException
      );
    });

    it('throws DeletedException when label is already deleted', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const label = await createTestTaskLabel(admin, organizationId, 'Test Label', '#3B82F6');
      await prisma.task_Label.update({ where: { taskLabelId: label.taskLabelId }, data: { dateDeleted: new Date() } });

      await expect(async () => TasksService.deleteTaskLabel(admin, label.taskLabelId, organization)).rejects.toThrow(
        DeletedException
      );
    });

    it('throws InvalidOrganizationException when label belongs to a different organization', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Org',
          userCreated: { connect: { userId: admin.userId } }
        }
      });
      const otherUser = await createTestUser(flashAdmin, otherOrg.organizationId);
      const label = await createTestTaskLabel(otherUser, otherOrg.organizationId, 'Test Label', '#3B82F6');

      await expect(async () => TasksService.deleteTaskLabel(admin, label.taskLabelId, organization)).rejects.toThrow(
        InvalidOrganizationException
      );
    });
  });
});
