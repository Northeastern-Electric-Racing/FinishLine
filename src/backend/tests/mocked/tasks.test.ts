import { Task, Task_Priority, Task_Status } from '@prisma/client';
import { WbsNumber } from 'shared';
import taskQueryArgs from '../../src/prisma-query-args/tasks.query-args';
import prisma from '../../src/prisma/prisma';
import TasksService from '../../src/services/tasks.services';
import * as taskTransformer from '../../src/transformers/tasks.transformer';
import { AccessDeniedException, HttpException, NotFoundException, DeletedException } from '../../src/utils/errors.utils';
import * as userUtils from '../../src/utils/users.utils';
import * as taskUtils from '../../src/utils/tasks.utils';
import * as teamUtils from '../../src/utils/teams.utils';
import {
  invalidTaskNotes,
  taskSaveTheDayDeletedPrisma,
  taskSaveTheDayInProgressPrisma,
  taskSaveTheDayInProgressShared,
  taskSaveTheDayPrisma,
  taskSaveTheDayShared
} from '../test-data/tasks.test-data';
import {
  aquaman,
  batman,
  batmanSettings,
  greenlantern,
  superman,
  supermanSettings,
  theVisitor,
  wonderwoman
} from '../test-data/users.test-data';
import { prismaWbsElement1 } from '../test-data/wbs-element.test-data';
import { prismaProject1 } from '../test-data/projects.test-data';
import { justiceLeague, prismaTeam1 } from '../test-data/teams.test-data';

describe('Tasks', () => {
  const mockDate = new Date('2022-12-25T00:00:00.000Z');
  const mockWBSNum: WbsNumber = {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  };
  const mockProjectWithTeam = { ...prismaProject1, teams: [{ ...prismaTeam1 }] };
  const mockWBSElementWithProject = { ...prismaWbsElement1, project: { ...mockProjectWithTeam } };

  afterEach(() => {
    vi.clearAllMocks();
  });

  beforeEach(() => {
    vi.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayShared);
    vi.spyOn(teamUtils, 'allUsersOnTeam').mockReturnValue(true);
    vi.spyOn(teamUtils, 'isUserOnTeam').mockReturnValue(true);
  });

  describe('createTask', () => {
    beforeEach(() => {
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(mockWBSElementWithProject);
    });

    test('create task fails when user does not have permission', async () => {
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([]);
      vi.spyOn(teamUtils, 'isUserOnTeam').mockReturnValue(false);

      await expect(() =>
        TasksService.createTask(theVisitor, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(
        new AccessDeniedException(
          'Only admins, app-admins, project leads, project managers, work package leads, work package managers, or current team users can create tasks'
        )
      );

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('create task fails when title is over word count', async () => {
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([]);

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
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    test('create task fails when notes is over word count', async () => {
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([]);

      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', invalidTaskNotes, mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new HttpException(400, 'Notes must be less than 250 words'));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
    });

    test('create task fails when wbs element doesnt exist', async () => {
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new NotFoundException('WBS Element', '1.2.0'));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('create task fails when wbs element has been deleted', async () => {
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue({ ...prismaWbsElement1, dateDeleted: mockDate });

      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new DeletedException('WBS Element', '1.2.0'));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('create task fails when assignees are not on the project team', async () => {
      vi.spyOn(teamUtils, 'areUsersPartOfTeams').mockReturnValue(false);
      vi.spyOn(userUtils, 'getUsers').mockResolvedValue([]);

      await expect(() =>
        TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [
          batman.userId,
          wonderwoman.userId
        ])
      ).rejects.toThrow(new HttpException(400, `All assignees must be part of one of the project's team!`));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('create task succeeds', async () => {
      vi.spyOn(teamUtils, 'areUsersPartOfTeams').mockReturnValue(true);
      vi.spyOn(prisma.task, 'create').mockResolvedValue(taskSaveTheDayPrisma);
      vi.spyOn(prisma.user, 'findMany').mockResolvedValue([batman, wonderwoman]);
      vi.spyOn(prisma.user_Settings, 'findMany').mockResolvedValue([batmanSettings, supermanSettings]);

      const task = await TasksService.createTask(batman, mockWBSNum, 'hellow world', '', mockDate, 'HIGH', 'DONE', [
        batman.userId,
        wonderwoman.userId
      ]);

      expect(task).toStrictEqual(taskSaveTheDayShared);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.task.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('editTaskStatus', () => {
    test('edit task status succeeds', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      vi.spyOn(prisma.task, 'update').mockResolvedValue(taskSaveTheDayInProgressPrisma);
      vi.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayInProgressShared);

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
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      vi.spyOn(prisma.task, 'update').mockResolvedValue(taskSaveTheDayInProgressPrisma);
      vi.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayInProgressShared);

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
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      const fakeTaskId = '100';
      await expect(() => TasksService.editTaskStatus(batman, fakeTaskId, Task_Status.IN_BACKLOG)).rejects.toThrow(
        new NotFoundException('Task', fakeTaskId)
      );
    });

    test('edit task fails if user does not have permission', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      vi.spyOn(prisma.task, 'update').mockResolvedValue(taskSaveTheDayInProgressPrisma);
      vi.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayInProgressShared);

      const taskId = '1';
      // Try updating from IN_PROGRESS to IN_BACKLOG
      await expect(() => TasksService.editTaskStatus(aquaman, taskId, Task_Status.IN_BACKLOG)).rejects.toThrow(
        new AccessDeniedException(
          'Only admins, app admins, heads, task creators, project leads, project managers, or project assignees can edit a task'
        )
      );
    });

    test('edit task fails if the user did not create the task or is not an assignee', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      vi.spyOn(prisma.task, 'update').mockResolvedValue(taskSaveTheDayInProgressPrisma);
      vi.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayInProgressShared);

      const taskId = '1';
      // Try updating from IN_PROGRESS to IN_BACKLOG
      // Aquaman is a leader, but did not create this task
      await expect(() => TasksService.editTaskStatus(aquaman, taskId, Task_Status.IN_BACKLOG)).rejects.toThrow(
        new AccessDeniedException(
          'Only admins, app admins, heads, task creators, project leads, project managers, or project assignees can edit a task'
        )
      );
    });

    test('edit task fails if task is deleted', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayDeletedPrisma);

      const taskId = '1';
      // Try updating from IN_PROGRESS to IN_BACKLOG
      await expect(() => TasksService.editTaskStatus(batman, taskId, Task_Status.IN_BACKLOG)).rejects.toThrow(
        new DeletedException('Task', taskId)
      );
    });
  });

  describe('editTaskAssignees', () => {
    test('edit task assignee succeeds', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue({
        ...taskSaveTheDayPrisma,
        wbsElement: { project: { teams: [justiceLeague] } }
      } as Task);
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(mockWBSElementWithProject);
      vi.spyOn(prisma.task, 'update').mockResolvedValue(taskSaveTheDayInProgressPrisma);
      vi.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayInProgressShared);
      vi.spyOn(userUtils, 'getUsers').mockResolvedValue([batman, wonderwoman]);
      vi.spyOn(teamUtils, 'areUsersPartOfTeams').mockReturnValue(true);
      vi.spyOn(prisma.user_Settings, 'findMany').mockResolvedValue([batmanSettings, supermanSettings]);

      const taskId = '1';
      const userIds = [
        {
          userId: batman.userId
        },
        {
          userId: wonderwoman.userId
        }
      ];
      const updatedTask = await TasksService.editTaskAssignees(batman, taskId, [batman.userId, wonderwoman.userId]);

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.task.update).toHaveBeenCalledTimes(1);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { taskId },
        data: {
          assignees: {
            set: userIds
          }
        },
        ...taskQueryArgs
      });
      expect(updatedTask).toStrictEqual(taskSaveTheDayInProgressShared);
    });

    test('edit task assignees fails when task does not exist', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      const fakeTaskId = '100';
      await expect(() =>
        TasksService.editTaskAssignees(batman, fakeTaskId, [superman.userId, wonderwoman.userId])
      ).rejects.toThrow(new NotFoundException('Task', fakeTaskId));
    });

    test('edit task assignees fails if user does not have permission', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      vi.spyOn(prisma.task, 'update').mockResolvedValue(taskSaveTheDayInProgressPrisma);
      vi.spyOn(taskTransformer, 'default').mockReturnValue(taskSaveTheDayInProgressShared);

      const taskId = '1';
      await expect(() =>
        TasksService.editTaskAssignees(aquaman, taskId, [superman.userId, wonderwoman.userId])
      ).rejects.toThrow(
        new AccessDeniedException(
          'Only admins, app admins, heads, task creators, project leads, project managers, or project assignees can edit a task'
        )
      );
    });

    test('edit task assignees fails if task is deleted', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayDeletedPrisma);

      const taskId = '1';
      await expect(() =>
        TasksService.editTaskAssignees(batman, taskId, [superman.userId, wonderwoman.userId])
      ).rejects.toThrow(new DeletedException('Task', taskId));
    });
  });

  describe('deleteTask', () => {
    const mockTaskId = '4';

    test('delete task fails when task does not exist', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);

      await expect(() => TasksService.deleteTask(batman, mockTaskId)).rejects.toThrow(
        new NotFoundException('Task', mockTaskId)
      );

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
    });

    test('delete task fails when task is already deleted', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayDeletedPrisma);

      await expect(() => TasksService.deleteTask(batman, mockTaskId)).rejects.toThrow(
        new DeletedException('Task', mockTaskId)
      );

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
    });

    test('delete task fails when wbs element does not exist', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);

      await expect(() => TasksService.deleteTask(batman, mockTaskId)).rejects.toThrow(
        new NotFoundException('WBS Element', taskSaveTheDayPrisma.wbsElementId)
      );

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('delete task fails when wbs element is deleted', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue({ ...prismaWbsElement1, dateDeleted: new Date() });

      await expect(() => TasksService.deleteTask(batman, mockTaskId)).rejects.toThrow(
        new DeletedException('WBS Element', '1.2.0')
      );

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('delete task fails when user does not have permission', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement1);

      await expect(() => TasksService.deleteTask(wonderwoman, mockTaskId)).rejects.toThrow(
        new AccessDeniedException('Only admin, app-admins, project leads, and project managers can delete tasks')
      );

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('delete task succeeds', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      vi.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement1);
      vi.spyOn(prisma.task, 'delete').mockResolvedValue(taskSaveTheDayDeletedPrisma);

      const deletedTask = await TasksService.deleteTask(batman, mockTaskId);

      expect(deletedTask).toEqual(taskSaveTheDayPrisma.taskId);
      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.task.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('editTask', () => {
    const taskId = '1';
    const fakeTitle = 'Dont save the day';
    const fakeNotes = 'Leave the people in the burning building';
    const fakePriority = Task_Priority.LOW;
    const fakeDeadline = new Date();

    beforeEach(() => {
      vi.spyOn(taskUtils, 'hasPermissionToEditTask').mockResolvedValue(true);
    });

    test('user access denied', async () => {
      vi.spyOn(taskUtils, 'hasPermissionToEditTask').mockResolvedValue(false);
      await expect(() =>
        TasksService.editTask(wonderwoman, taskId, fakeTitle, fakeNotes, fakePriority, fakeDeadline)
      ).rejects.toThrow(
        new AccessDeniedException(
          'Only admins, app admins, heads, task creators, project leads, project managers, or project assignees can edit a task'
        )
      );
    });

    test('Task not found', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        TasksService.editTask(superman, taskId, fakeTitle, fakeNotes, fakePriority, fakeDeadline)
      ).rejects.toThrow(new NotFoundException('Task', taskId));
      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Task deleted', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue({ ...taskSaveTheDayPrisma, dateDeleted: new Date('1/1/2023') });
      await expect(() =>
        TasksService.editTask(superman, taskId, fakeTitle, fakeNotes, fakePriority, fakeDeadline)
      ).rejects.toThrow(new DeletedException('Task', taskId));
      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Title over Limit', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      await expect(() =>
        TasksService.editTask(
          superman,
          taskId,
          'A B C D E F G H I J K L M N O',
          invalidTaskNotes,
          fakePriority,
          fakeDeadline
        )
      ).rejects.toThrow(new HttpException(400, 'Title must be less than 15 words'));
      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Notes over limit', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      await expect(() =>
        TasksService.editTask(superman, taskId, fakeTitle, invalidTaskNotes, fakePriority, fakeDeadline)
      ).rejects.toThrow(new HttpException(400, 'Notes must be less than 250 words'));
      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
    });

    test('Task successfully edited', async () => {
      vi.spyOn(prisma.task, 'findUnique').mockResolvedValue(taskSaveTheDayPrisma);
      const updatedSaveTheDay = {
        ...taskSaveTheDayPrisma,
        title: fakeTitle,
        notes: fakeNotes,
        priority: fakePriority,
        deadline: fakeDeadline
      };
      vi.spyOn(prisma.task, 'update').mockResolvedValue(updatedSaveTheDay);
      const response = await TasksService.editTask(superman, taskId, fakeTitle, fakeNotes, fakePriority, fakeDeadline);

      expect(prisma.task.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.task.update).toHaveBeenCalledTimes(1);
      expect(response).toStrictEqual(taskTransformer.default(updatedSaveTheDay));
    });
  });
});
