import { financeMember, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data.js';
import { AccessDeniedException, HttpException } from '../../src/utils/errors.utils.js';
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

  test('Guests cannot edit tasks', async () => {
    const guest = await createTestUser(theVisitorGuest, organizationId);
    const admin = await createTestUser(supermanAdmin, organizationId);
    const task = await createTestTask(admin, 'Test', '', [], 'HIGH', 'DONE', organizationId, new Date());
    await expect(async () =>
      TasksService.editTask(guest, organizationId, task.taskId, 'Title', 'Notes', 'HIGH', new Date())
    ).rejects.toThrow(new AccessDeniedException('Guests cannot edit tasks'));
  });
});
