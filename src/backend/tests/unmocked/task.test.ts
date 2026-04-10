import { financeMember, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data.js';
import { AccessDeniedException, HttpException, NotFoundException, DeletedException } from '../../src/utils/errors.utils.js';
import {
  createTestOrganization,
  createTestTask,
  createTestUser,
  resetUsers,
  createTestCar,
  createTestProject
} from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import TasksService from '../../src/services/tasks.services.js';
import { WbsNumber } from 'shared';

describe('Task Tests', () => {
  let organizationId: string;

  beforeEach(async () => {
    ({ organizationId } = await createTestOrganization());
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

      const updatedTask = await TasksService.editTask(
        user,
        organizationId,
        task.taskId,
        'Test Task',
        '',
        'HIGH',
        undefined,
        undefined,
        newWbsNum
      );

      expect(updatedTask.taskId).toBe(task.taskId);
      expect(updatedTask.wbsNum).toBeDefined();
    });

    it('does not update wbs element when wbsNum is not provided', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      const updatedTask = await TasksService.editTask(user, organizationId, task.taskId, 'Updated Title', '', 'HIGH');

      expect(updatedTask.taskId).toBe(task.taskId);
      expect(updatedTask.title).toBe('Updated Title');
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
          undefined,
          undefined,
          deletedWbsNum
        )
      ).rejects.toThrow(DeletedException);
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
      // check that status changed to correct status
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
  });

  describe('Get tasks by wbs num', () => {
    it('returns project tasks and all WP tasks when given a project wbs number', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const car = await createTestCar(organizationId, user.userId);
      const project = await createTestProject(user, organizationId, undefined, car.carId);

      // create a task on the project wbs element
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

      // create a WP on the project
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

      // create a task on the WP
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

      const tasks = await TasksService.getTasksByWbsNum({ carNumber: 0, projectNumber: 1, workPackageNumber: 0 }, {
        organizationId
      } as any);

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

      const tasks = await TasksService.getTasksByWbsNum({ carNumber: 0, projectNumber: 1, workPackageNumber: 1 }, {
        organizationId
      } as any);

      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('WP Task');
    });

    it('throws NotFoundException when wbs element does not exist', async () => {
      await expect(async () =>
        TasksService.getTasksByWbsNum({ carNumber: 99, projectNumber: 99, workPackageNumber: 0 }, { organizationId } as any)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Guest editing permissions', () => {
    it('does not let guests edit tasks', async () => {
      const guest = await createTestUser(theVisitorGuest, organizationId);
      const admin = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(admin, 'Test', '', [], 'HIGH', 'DONE', organizationId, new Date());
      await expect(async () =>
        TasksService.editTask(guest, organizationId, task.taskId, 'Title', 'Notes', 'HIGH', new Date())
      ).rejects.toThrow(new AccessDeniedException('Guests cannot edit tasks'));
    });
  });
});
