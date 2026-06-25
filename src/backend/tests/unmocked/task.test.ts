import { financeMember, flashAdmin, supermanAdmin, theVisitorGuest } from '../test-data/users.test-data.js';
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
  createTestUser,
  resetUsers,
  createTestCar,
  createTestProject
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

      const updatedTask = await TasksService.editTask(
        user,
        organizationId,
        task.taskId,
        'Test Task',
        '',
        'HIGH',
        [],
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

      const updatedTask = await TasksService.editTask(user, organizationId, task.taskId, 'Updated Title', '', 'HIGH', []);

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
          undefined,
          undefined,
          deletedWbsNum
        )
      ).rejects.toThrow(DeletedException);
    });

    it('successfully sets labels on a task', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);
      const label = await TasksService.createTaskLabel(user, 'Test Label', '#3B82F6', organization);

      const updatedTask = await TasksService.editTask(user, organizationId, task.taskId, 'Test Task', '', 'HIGH', [
        label.taskLabelId
      ]);

      expect(updatedTask.labels).toHaveLength(1);
      expect(updatedTask.labels[0].taskLabelId).toBe(label.taskLabelId);
    });

    it('throws NotFoundException when a label id does not exist', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);

      await expect(async () =>
        TasksService.editTask(user, organizationId, task.taskId, 'Test Task', '', 'HIGH', ['nonexistent-label-id'])
      ).rejects.toThrow(NotFoundException);
    });

    it('throws DeletedException when a label is deleted', async () => {
      const user = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(user, 'Test Task', '', [], 'HIGH', 'IN_BACKLOG', organizationId);
      const label = await TasksService.createTaskLabel(user, 'Test Label', '#3B82F6', organization);
      await prisma.task_Label.update({ where: { taskLabelId: label.taskLabelId }, data: { dateDeleted: new Date() } });

      await expect(async () =>
        TasksService.editTask(user, organizationId, task.taskId, 'Test Task', '', 'HIGH', [label.taskLabelId])
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
      const label = await TasksService.createTaskLabel(otherUser, 'Test Label', '#3B82F6', otherOrg);

      await expect(async () =>
        TasksService.editTask(user, organizationId, task.taskId, 'Test Task', '', 'HIGH', [label.taskLabelId])
      ).rejects.toThrow(InvalidOrganizationException);
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
      const label = await TasksService.createTaskLabel(user, 'Bug', '#EF4444', organization);

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
  });

  describe('Guest editing permissions', () => {
    it('does not let guests edit tasks', async () => {
      const guest = await createTestUser(theVisitorGuest, organizationId);
      const admin = await createTestUser(supermanAdmin, organizationId);
      const task = await createTestTask(admin, 'Test', '', [], 'HIGH', 'DONE', organizationId, new Date());
      await expect(async () =>
        TasksService.editTask(guest, organizationId, task.taskId, 'Title', 'Notes', 'HIGH', [], new Date())
      ).rejects.toThrow(new AccessDeniedException('Guests cannot edit tasks'));
    });
  });

  describe('Create task label', () => {
    it('successfully creates a task label as admin', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });

      const label = await TasksService.createTaskLabel(admin, 'Bug', '#EF4444', organization);

      expect(label.name).toBe('Bug');
      expect(label.colorHexCode).toBe('#EF4444');
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
      const label = await TasksService.createTaskLabel(admin, 'Test Label', '#3B82F6', organization);

      const updated = await TasksService.editTaskLabel(admin, label.taskLabelId, 'New Name', '#22C55E', organization);

      expect(updated.name).toBe('New Name');
      expect(updated.colorHexCode).toBe('#22C55E');
    });

    it('throws AccessDeniedException when non-admin tries to edit a task label', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const member = await createTestUser(financeMember, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const label = await TasksService.createTaskLabel(admin, 'Test Label', '#3B82F6', organization);

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
      const label = await TasksService.createTaskLabel(admin, 'Test Label', '#3B82F6', organization);
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
      const label = await TasksService.createTaskLabel(otherUser, 'Test Label', '#3B82F6', otherOrg);

      await expect(async () =>
        TasksService.editTaskLabel(admin, label.taskLabelId, 'New Name', '#22C55E', organization)
      ).rejects.toThrow(InvalidOrganizationException);
    });
  });

  describe('Delete task label', () => {
    it('successfully deletes a task label as admin', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const label = await TasksService.createTaskLabel(admin, 'Test Label', '#3B82F6', organization);

      const deletedId = await TasksService.deleteTaskLabel(admin, label.taskLabelId, organization);

      expect(deletedId).toBe(label.taskLabelId);
      const inDb = await prisma.task_Label.findUnique({ where: { taskLabelId: label.taskLabelId } });
      expect(inDb?.dateDeleted).not.toBeNull();
    });

    it('throws AccessDeniedException when non-admin tries to delete a task label', async () => {
      const admin = await createTestUser(supermanAdmin, organizationId);
      const member = await createTestUser(financeMember, organizationId);
      const organization = await prisma.organization.findUniqueOrThrow({ where: { organizationId } });
      const label = await TasksService.createTaskLabel(admin, 'Test Label', '#3B82F6', organization);

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
      const label = await TasksService.createTaskLabel(admin, 'Test Label', '#3B82F6', organization);
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
      const label = await TasksService.createTaskLabel(otherUser, 'Test Label', '#3B82F6', otherOrg);

      await expect(async () => TasksService.deleteTaskLabel(admin, label.taskLabelId, organization)).rejects.toThrow(
        InvalidOrganizationException
      );
    });
  });
});
