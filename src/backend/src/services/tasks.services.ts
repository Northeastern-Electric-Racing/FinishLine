import { Role, Task_Priority, Task_Status, User } from '@prisma/client';
import { Task } from 'shared';
import taskQueryArgs from '../prisma-query-args/tasks.query-args';
import prisma from '../prisma/prisma';
import taskTransformer from '../transformers/tasks.transformer';
import { NotFoundException, AccessDeniedException, HttpException } from '../utils/errors.utils';

export default class TasksService {
  /**
   * Creates a Task in the database
   * @param createdBy the user creating the task
   * @param wbsElementId the WBS Element to create the task for
   * @param title the title of the tas
   * @param notes the notes of the task
   * @param deadline the deadline of the task
   * @param priority the priority of the task
   * @param status the status of the task
   * @param assignees the assignees of the task
   * @returns the id of the successfully created task
   * @throws if the user does not have access to create a task, wbs element does not exist, or wbs element is deleted
   */
  static async createTask(
    createdBy: User,
    wbsElementId: number,
    title: string,
    notes: string,
    deadline: Date,
    priority: Task_Priority,
    status: Task_Status,
    assignees: User[]
  ): Promise<Task> {
    if (createdBy.role === Role.GUEST) throw new AccessDeniedException();

    const requestedWbsElement = await prisma.wBS_Element.findUnique({ where: { wbsElementId } });

    if (!requestedWbsElement) throw new NotFoundException('WBS Element', wbsElementId);

    if (requestedWbsElement.dateDeleted) throw new HttpException(400, "This task's wbs element has been deleted!");

    const createdTask = await prisma.task.create({
      data: {
        wbsElement: { connect: { wbsElementId } },
        title,
        notes,
        deadline,
        priority,
        status,
        createdBy: { connect: { userId: createdBy.userId } },
        assignees: { connect: assignees.map((assignee) => ({ userId: assignee.userId })) }
      },
      ...taskQueryArgs
    });

    return taskTransformer(createdTask);
  }
}
