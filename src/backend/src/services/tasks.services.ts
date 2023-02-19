import { Role, Task_Priority, Task_Status, User } from '@prisma/client';
import { isUnderWordCount, Task, WbsNumber, wbsPipe } from 'shared';
import taskQueryArgs from '../prisma-query-args/tasks.query-args';
import prisma from '../prisma/prisma';
import taskTransformer from '../transformers/tasks.transformer';
import { NotFoundException, AccessDeniedException, HttpException } from '../utils/errors.utils';

export default class TasksService {
  /**
   * Creates a Task in the database
   * @param createdBy the user creating the task
   * @param wbsNum the WBS Number to create the task for
   * @param title the title of the tas
   * @param notes the notes of the task
   * @param deadline the deadline of the task
   * @param priority the priority of the task
   * @param status the status of the task
   * @param assignees the assignees ids of the task
   * @returns the id of the successfully created task
   * @throws if the user does not have access to create a task, wbs element does not exist, or wbs element is deleted
   */
  static async createTask(
    createdBy: User,
    wbsNum: WbsNumber,
    title: string,
    notes: string,
    deadline: Date,
    priority: Task_Priority,
    status: Task_Status,
    assignees: number[]
  ): Promise<Task> {
    if (createdBy.role === Role.GUEST) throw new AccessDeniedException();

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');

    if (!isUnderWordCount(notes, 150)) throw new HttpException(400, 'Notes must be less than 250 words');

    const requestedWbsElement = await prisma.wBS_Element.findUnique({ where: { wbsNumber: wbsNum } });

    if (!requestedWbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));

    if (requestedWbsElement.dateDeleted) throw new HttpException(400, "This task's wbs element has been deleted!");

    const createdTask = await prisma.task.create({
      data: {
        wbsElement: { connect: { wbsNumber: wbsNum } },
        title,
        notes,
        deadline,
        priority,
        status,
        createdBy: { connect: { userId: createdBy.userId } },
        assignees: { connect: assignees.map((userId) => ({ userId })) }
      },
      ...taskQueryArgs
    });

    return taskTransformer(createdTask);
  }

  static async editTask(user: User, taskId: string, title: string, notes: string, priority: Task_Priority, deadline: Date) {
    if (user.role === Role.GUEST) throw new AccessDeniedException();

    const originalTask = await prisma.task.findUnique({ where: { taskId } });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.dateDeleted) throw new HttpException(400, 'Cant edit a deleted Task!');

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');

    if (!isUnderWordCount(notes, 150)) throw new HttpException(400, 'Notes must be less than 250 words');

    const updatedTask = await prisma.task.update({
      where: { taskId },
      data: { title, notes, priority, deadline },
      ...taskQueryArgs
    });
    return taskTransformer(updatedTask);
  }
}
