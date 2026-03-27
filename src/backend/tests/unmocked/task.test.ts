import { financeMember, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data.js';
import { AccessDeniedException, HttpException, NotFoundException, DeletedException } from '../../src/utils/errors.utils.js';
import { createTestOrganization, createTestTask, createTestUser, resetUsers } from '../test-utils.js';
import prisma from '../../src/prisma/prisma.js';
import TasksService from '../../src/services/tasks.services.js';

describe('Task Test', () => {
  let organizationId: string;
  beforeEach(async () => {
    ({ organizationId } = await createTestOrganization());
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Edit task status', () => {
    test('Setting status to in progress works when task has deadline and assignees', async () => {
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

    test('Setting status to in progress does not work when task does not have a deadline and assignees', async () => {
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

    test('Setting status to in progress does not work when task does not have a deadline, but does have assignees', async () => {
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

    test('Setting status to in progress does not work when task does not have assignees, but does have a deadline', async () => {
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

  describe('Edit task WBS element', () => {
    test('Successfully updates the wbs element of a task', async () => {
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

      const updatedTask = await TasksService.editTaskWbsElement(user, task.taskId, newWbsElement.wbsElementId, {
        organizationId
      } as any);

      expect(updatedTask.taskId).toBe(task.taskId);
    });

    test('Throws NotFoundException when task does not exist', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      await expect(async () =>
        TasksService.editTaskWbsElement(user, 'non-existent-task-id', task.wbsElementId, { organizationId } as any)
      ).rejects.toThrow(new NotFoundException('Task', 'non-existent-task-id'));
    });

    test('Throws DeletedException when task is deleted', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      await prisma.task.update({
        where: { taskId: task.taskId },
        data: { dateDeleted: new Date() }
      });

      await expect(async () =>
        TasksService.editTaskWbsElement(user, task.taskId, task.wbsElementId, { organizationId } as any)
      ).rejects.toThrow(new DeletedException('Task', task.taskId));
    });

    test('Throws NotFoundException when new wbs element does not exist', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      await expect(async () =>
        TasksService.editTaskWbsElement(user, task.taskId, 'non-existent-wbs-element-id', { organizationId } as any)
      ).rejects.toThrow(new NotFoundException('WBS Element', 'non-existent-wbs-element-id'));
    });

    test('Throws DeletedException when new wbs element is deleted', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      // create second wbs element and delete it
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

      await expect(async () =>
        TasksService.editTaskWbsElement(user, task.taskId, deletedWbsElement.wbsElementId, { organizationId } as any)
      ).rejects.toThrow(new DeletedException('WBS Element', deletedWbsElement.wbsElementId));
    });
  });

  describe('Guest editing permissions', () => {
    test('Guests cannot edit tasks', async () => {
      const guest = await createTestUser(theVisitorGuest, organizationId);
      const admin = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(admin, 'Test', '', [], 'HIGH', 'DONE', organizationId, new Date());
      await expect(async () =>
        TasksService.editTask(guest, organizationId, task.taskId, 'Title', 'Notes', 'HIGH', new Date())
      ).rejects.toThrow(new AccessDeniedException('Guests cannot edit tasks'));
    });

    test('Guests cannot edit task wbs element', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const guest = await createTestUser(theVisitorGuest, organizationId);
      const task = await createTestTask(admin, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      await expect(async () =>
        TasksService.editTaskWbsElement(guest, task.taskId, task.wbsElementId, { organizationId } as any)
      ).rejects.toThrow(new AccessDeniedException('Guests cannot edit tasks'));
    });
  });
});
