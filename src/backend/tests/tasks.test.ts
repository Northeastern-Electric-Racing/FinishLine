import prisma from '../src/prisma/prisma';
import { batman, wonderwoman } from './test-data/users.test-data';
import { AccessDeniedException, HttpException, NotFoundException } from '../src/utils/errors.utils';
import TasksService from '../src/services/tasks.services';
import { prismaWbsElement1 } from './test-data/wbs-element.test-data';
import { saveTheDay, save_the_day } from './test-data/tasks.test-data';

describe('Tasks', () => {
  const mockDate = new Date('2022-12-25T00:00:00.000Z');

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    test('create task fails when user does not have permission', async () => {
      await expect(() =>
        TasksService.createTask(wonderwoman, 1, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new AccessDeniedException());
    });

    test('create task fails when wbs element doesnt exist', async () => {
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        TasksService.createTask(batman, 1, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new NotFoundException('WBS Element', 1));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('create task fails when wbs element has been deleted', async () => {
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue({ ...prismaWbsElement1, dateDeleted: mockDate });

      await expect(() =>
        TasksService.createTask(batman, 1, 'hellow world', '', mockDate, 'HIGH', 'DONE', [])
      ).rejects.toThrow(new HttpException(400, "This task's wbs element has been deleted!"));

      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });

    test('create task succeeds', async () => {
      jest.spyOn(prisma.wBS_Element, 'findUnique').mockResolvedValue(prismaWbsElement1);
      jest.spyOn(prisma.task, 'create').mockResolvedValue(save_the_day);

      const task = await TasksService.createTask(batman, 1, 'hellow world', '', mockDate, 'HIGH', 'DONE', []);

      expect(task).toStrictEqual(saveTheDay);
      expect(prisma.wBS_Element.findUnique).toHaveBeenCalledTimes(1);
    });
  });
});
