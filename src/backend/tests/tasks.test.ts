import { Task_Status } from '@prisma/client';
import { WbsNumber } from 'shared';
import taskQueryArgs from '../src/prisma-query-args/tasks.query-args';
import prisma from '../src/prisma/prisma';
import TasksService from '../src/services/tasks.services';
import * as taskTransformer from '../src/transformers/tasks.transformer';
import { AccessDeniedException, HttpException, NotFoundException } from '../src/utils/errors.utils';
import {
  invalidTaskNotes,
  taskSaveTheDayDeletedPrisma,
  taskSaveTheDayInProgressPrisma,
  taskSaveTheDayInProgressShared,
  taskSaveTheDayPrisma,
  taskSaveTheDayShared
} from './test-data/tasks.test-data';
import { aquaman, batman, greenlantern, wonderwoman } from './test-data/users.test-data';
import { prismaWbsElement1 } from './test-data/wbs-element.test-data';

describe('Tasks', () => {
  const mockDate = new Date('2022-12-25T00:00:00.000Z');
  const mockWBSNum: WbsNumber = {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    jest.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayShared);
  });

  describe('createTask', () => {
    test('create task fails when user does not have permission', async () => {
      await expect(() =>
        TasksService.createTask(wonderwoman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new AccessDeniedException());
    });

    test('create task fails when title is over word count', async () => {
      await expect(() =>
        TasksService.createTask(
          batman,
          mockWBSNum,
          'WE NEED TO SAVE THE DAY VERY VERY VERY VERY VERY VERY VERY VERY VERY QUICKLY',
          'DO IT NOW',
          mockDate,
          'HIGH',
          'DONE',
          []
        )
      ).rejects.toThrow(new HttpException(400, 'Title must be less than 15 words'));
    });

    test('create task fails when notes is over word count', async () => {
      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', invalidTaskNotes, mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new HttpException(400, 'Notes must be less than 250 words'));
    });

    test('create task fails when wbs element doesnt exist', async () => {
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new NotFoundException('WBS Element', '1.2.0'));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('create task fails when wbs element has been deleted', async () => {
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue({ ...prismaWbsElement1, dateDeleted: mockDate });

      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new HttpException(400, "This task's wbs element has been deleted!"));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('create task fails when assignees do not exist', async () => {
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement1);
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([wonderwoman]);

      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [
          batman.userId,
          wonderwoman.userId
        ])
      ).rejects.toThrow(new HttpException(404, `User(s) with the following ids not found: 1`));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    test('create task succeeds', async () => {
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement1);
      jest.spyOn(prisma.task, 'create').mockResolvedValue(taskSaveTheDayPrisma);
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([batman, wonderwoman]);

      const task = await TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [
        batman.userId,
        wonderwoman.userId
      ]);

      expect(task).toStrictEqual(taskSaveTheDayShared);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.task.create).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });
  });

  describe('editTaskStatus', () => {
    test('edit task status succeeds', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      jest.spyOn(prisma.task, 'update').mockResolvedValue(taskSaveTheDayInProgressPrisma);
      jest.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayInProgressShared);

      const taskId = '1';
      // Update from IN_PROGRESS to IN_BACKLOG
      const updatedTask = await TasksService.editTaskStatus(batman, taskId, Task_Status.IN_BACKLOG);

      expect(updatedTask).toStrictEqual(taskSaveTheDayInProgressShared);
      expect(prisma.task.update).toHaveBeenCalledTimes(1);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { taskId },
        data: {
          status: 'IN_BACKLOG'
        },
        ...taskQueryArgs
      });
    });

    test('edit task status succeeds if the user is an assignee', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      jest.spyOn(prisma.task, 'update').mockResolvedValue(taskSaveTheDayInProgressPrisma);
      jest.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayInProgressShared);

      const taskId = '1';
      // Update from IN_PROGRESS to IN_BACKLOG
      // Greenlantern is a wbs element assignee
      const updatedTask = await TasksService.editTaskStatus(greenlantern, taskId, Task_Status.IN_BACKLOG);

      expect(updatedTask).toStrictEqual(taskSaveTheDayInProgressShared);
      expect(prisma.task.update).toHaveBeenCalledTimes(1);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { taskId },
        data: {
          status: 'IN_BACKLOG'
        },
        ...taskQueryArgs
      });
    });

    test('edit task fails when task does not exist', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      const fakeTaskId = '100';
      await expect(() => TasksService.editTaskStatus(batman, fakeTaskId, Task_Status.IN_BACKLOG)).rejects.toThrow(
        new NotFoundException('Task', fakeTaskId)
      );
    });

    test('edit task fails if user does not have permission', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      jest.spyOn(prisma.task, 'update').mockResolvedValue(taskSaveTheDayInProgressPrisma);
      jest.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayInProgressShared);

      const taskId = '1';
      // Try updating from IN_PROGRESS to IN_BACKLOG
      await expect(() => TasksService.editTaskStatus(aquaman, taskId, Task_Status.IN_BACKLOG)).rejects.toThrow(
        new AccessDeniedException(
          'Only admins, app admins, task creators, project leads, project managers, or project assignees can edit a task'
        )
      );
    });

    test('edit task fails if the user did not create the task or is not an assignee', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      jest.spyOn(prisma.task, 'update').mockResolvedValue(taskSaveTheDayInProgressPrisma);
      jest.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayInProgressShared);

      const taskId = '1';
      // Try updating from IN_PROGRESS to IN_BACKLOG
      // Aquaman is a leader, but did not create this task
      await expect(() => TasksService.editTaskStatus(aquaman, taskId, Task_Status.IN_BACKLOG)).rejects.toThrow(
        new AccessDeniedException(
          'Only admins, app admins, task creators, project leads, project managers, or project assignees can edit a task'
        )
      );
    });

    test('edit task fails if task is deleted', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayDeletedPrisma);

      const taskId = '1';
      // Try updating from IN_PROGRESS to IN_BACKLOG
      await expect(() => TasksService.editTaskStatus(batman, taskId, Task_Status.IN_BACKLOG)).rejects.toThrow(
        new HttpException(400, 'Cant edit a deleted Task!')
      );
    });
  });

  describe('deleteTask', () => {
    const mockTaskId = '4';

    test('delete task fails when task does not exist', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      await expect(() => TasksService.deleteTask(batman, mockTaskId)).rejects.toThrow(
        new NotFoundException('Task', mockTaskId)
      );

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
    });

    test('delete task fails when task is already deleted', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayDeletedPrisma);

      await expect(() => TasksService.deleteTask(batman, mockTaskId)).rejects.toThrow(
        new HttpException(400, 'Cant delete a deleted Task!')
      );

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
    });

    test('delete task fails when wbs element does not exist', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);

      await expect(() => TasksService.deleteTask(batman, mockTaskId)).rejects.toThrow(
        new NotFoundException('WBS Element', taskSaveTheDayPrisma.wbsElementId)
      );

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('delete task fails when wbs element is deleted', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue({ ...prismaWbsElement1, dateDeleted: new Date() });

      await expect(() => TasksService.deleteTask(batman, mockTaskId)).rejects.toThrow(
        new HttpException(400, "This task's wbs element has been deleted!")
      );

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('delete task fails when user does not have permission', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement1);

      await expect(() => TasksService.deleteTask(wonderwoman, mockTaskId)).rejects.toThrow(new AccessDeniedException());

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('delete task succeeds', async () => {
      jest.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement1);
      jest.spyOn(prisma.task, 'delete').mockResolvedValue(taskSaveTheDayDeletedPrisma);

      const deletedTask = await TasksService.deleteTask(batman, mockTaskId);

      expect(deletedTask).toEqual(taskSaveTheDayPrisma.taskId);
      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.task.update).toHaveBeenCalledTimes(1);
    });
  });
});
