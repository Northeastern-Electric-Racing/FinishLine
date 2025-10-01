import { Task_Priority, Task_Status, Organization } from '@prisma/client';
import { isAdmin, isUnderWordCount, notGuest, Task, TaskCardPreview, WbsNumber, wbsPipe, User } from 'shared';
import prisma from '../prisma/prisma';
import taskTransformer, { taskCardPreviewTransformer } from '../transformers/tasks.transformer';
import {
  NotFoundException,
  AccessDeniedException,
  HttpException,
  DeletedException,
  InvalidOrganizationException
} from '../utils/errors.utils';
import { sendSlackTaskAssignedNotificationToUsers } from '../utils/tasks.utils';
import { getUsers, userHasPermission } from '../utils/users.utils';
import { wbsNumOf } from '../utils/utils';
import { getTeamQueryArgs } from '../prisma-query-args/teams.query-args';
import { getTaskPreviewQueryArgs, getTaskQueryArgs } from '../prisma-query-args/tasks.query-args';
import { getProjectQueryArgs } from '../prisma-query-args/projects.query-args';

export default class TasksService {
  /**
   * Creates a Task in the database
   * @param createdBy the user creating the task
   * @param wbsNum the WBS Number to create the task for
   * @param title the title of the tas
   * @param notes the notes of the task
   * @param priority the priority of the task
   * @param status the status of the task
   * @param assignees the assignees ids of the task
   * @param organizationId the organization that the user is currently in
   * @param deadline the deadline of the task
   * @returns the id of the successfully created task
   * @throws if the user does not have access to create a task, wbs element does not exist, or wbs element is deleted
   */
  static async createTask(
    createdBy: User,
    wbsNum: WbsNumber,
    title: string,
    notes: string,
    priority: Task_Priority,
    status: Task_Status,
    assignees: string[],
    organization: Organization,
    startDate?: Date,
    deadline?: Date
  ): Promise<Task> {
    const requestedWbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          ...wbsNum,
          organizationId: organization.organizationId
        }
      },
      include: {
        project: {
          include: {
            teams: getTeamQueryArgs(organization.organizationId),
            wbsElement: true,
            workPackages: { include: { wbsElement: true } }
          }
        }
      }
    });
    if (!requestedWbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
    if (requestedWbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));
    const { project } = requestedWbsElement;
    if (!project) throw new HttpException(400, "This task's wbs element is not linked to a project!");

    const { teams } = project;
    if (!teams || teams.length === 0)
      throw new HttpException(400, 'This project needs to be assigned to a team to create a task!');

    if (await !userHasPermission(createdBy.userId, organization.organizationId, notGuest)) {
      throw new AccessDeniedException('Guests cannot create tasks');
    }

    const users = await getUsers(assignees); // this throws if any of the users aren't found

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');
    if (!isUnderWordCount(notes, 250)) throw new HttpException(400, 'Notes must be less than 250 words');

    if (status === 'IN_PROGRESS' && (!deadline || assignees.length === 0)) {
      throw new HttpException(400, 'Tasks in progress must have a dealine and assignees');
    }

    const createdTask = await prisma.task.create({
      data: {
        wbsElement: {
          connect: {
            wbsNumber: {
              ...wbsNum,
              organizationId: organization.organizationId
            }
          }
        },
        title,
        notes,
        startDate,
        deadline,
        priority,
        status,
        createdBy: { connect: { userId: createdBy.userId } },
        assignees: { connect: users.map((user) => ({ userId: user.userId })) }
      },
      ...getTaskQueryArgs(organization.organizationId)
    });

    const newTask = taskTransformer(createdTask);

    await sendSlackTaskAssignedNotificationToUsers(newTask, assignees, organization.organizationId);

    return newTask;
  }

  /**
   * Edits a Task in the database
   * @param user the user editing the task
   * @param organizationId the organization id
   * @param taskId the task that is being edited
   * @param title the new title for the task
   * @param notes the new notes for the task
   * @param priority the new priority for the task
   * @param deadline the new deadline for the task
   * @returns the sucessfully edited task
   */
  static async editTask(
    user: User,
    organizationId: string,
    taskId: string,
    title: string,
    notes: string,
    priority: Task_Priority,
    startDate?: Date,
    deadline?: Date
  ) {
    const hasPermission = await userHasPermission(user.userId, organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit tasks');

    const originalTask = await prisma.task.findUnique({ where: { taskId }, include: { wbsElement: true } });

    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Task');
    if (originalTask.dateDeleted) throw new DeletedException('Task', taskId);

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');

    if (!isUnderWordCount(notes, 250)) throw new HttpException(400, 'Notes must be less than 250 words');

    const updatedTask = await prisma.task.update({
      where: { taskId },
      data: { title, notes, priority, startDate, deadline },
      ...getTaskQueryArgs(originalTask.wbsElement.organizationId)
    });
    return taskTransformer(updatedTask);
  }

  /**
   * Edits the status of a task in the database
   * @param user the user editing the task
   * @param organizationId the organizqtion Id
   * @param taskId the id of the task
   * @param status the new status
   * @returns the updated task
   * @throws if the task does not exist, the task is already deleted, or if the user does not have permissions
   */
  static async editTaskStatus(user: User, organizationId: string, taskId: string, status: Task_Status) {
    // Get the original task and check if it exists
    const originalTask = await prisma.task.findUnique({ where: { taskId }, include: { assignees: true, wbsElement: true } });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (organizationId !== originalTask.wbsElement.organizationId) throw new InvalidOrganizationException('Task');
    if (originalTask.dateDeleted) throw new DeletedException('Task', taskId);

    if (status === 'IN_PROGRESS' && (!originalTask.deadline || originalTask.assignees.length === 0)) {
      throw new HttpException(400, 'A task in progress must have a deadline and assignees!');
    }

    const hasPermission = await userHasPermission(user.userId, organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit tasks');

    const updatedTask = await prisma.task.update({
      where: { taskId },
      data: { status },
      ...getTaskQueryArgs(originalTask.wbsElement.organizationId)
    });
    return taskTransformer(updatedTask);
  }

  /**
   * Edits the assignees of a task in the database
   * @param user the user editing the task
   * @param taskId the id of the task
   * @param assignees the new assignees
   * @param organization the organization that the user is currently in
   * @returns the updated task
   * @throws if the task does not exist, the task is already deleted, any of the assignees don't exist, or if the user does not have permissions
   */
  static async editTaskAssignees(
    user: User,
    taskId: string,
    assignees: string[],
    organization: Organization
  ): Promise<Task> {
    // Get the original task and check if it exists
    const originalTask = await prisma.task.findUnique({
      where: { taskId },
      include: {
        wbsElement: { include: { project: getProjectQueryArgs(organization.organizationId) } },
        assignees: true
      }
    });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.dateDeleted) throw new DeletedException('Task', taskId);

    const originalAssigneeIds = originalTask.assignees.map((assignee) => assignee.userId);
    const newAssigneeIds = assignees.filter((userId) => !originalAssigneeIds.includes(userId));

    const hasPermission = await userHasPermission(user.userId, organization.organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit tasks');

    // this throws if any of the users aren't found
    const assigneeUsers = await getUsers(assignees);

    // retrieve userId for every assignee to update task's assignees in the database
    const transformedAssigneeUsers = assigneeUsers.map((user) => {
      return {
        userId: user.userId
      };
    });

    const updatedTask = taskTransformer(
      await prisma.task.update({
        where: { taskId },
        data: {
          assignees: {
            set: transformedAssigneeUsers
          }
        },
        ...getTaskQueryArgs(organization.organizationId)
      })
    );

    await sendSlackTaskAssignedNotificationToUsers(updatedTask, newAssigneeIds, organization.organizationId);

    return updatedTask;
  }

  /**
   * Delete task in the database
   * @param taskId the id number of the given task
   * @param currentUser the current user currently accessing the task
   * @param organizationId the organization that the user is currently in
   * @returns the deleted task
   * @throws if the user does not have permission
   */
  static async deleteTask(currentUser: User, taskId: string, organization: Organization): Promise<string> {
    const task = await prisma.task.findUnique({ where: { taskId }, ...getTaskQueryArgs(organization.organizationId) });
    if (!task) throw new NotFoundException('Task', taskId);
    if (task.dateDeleted) throw new DeletedException('Task', taskId);

    const wbsElement = await prisma.wBS_Element.findUnique({ where: { wbsElementId: task.wbsElementId } });
    if (!wbsElement) throw new NotFoundException('WBS Element', task.wbsElementId);
    if (wbsElement.dateDeleted) {
      const wbsNum = wbsNumOf(wbsElement);
      throw new DeletedException('WBS Element', wbsPipe(wbsNum));
    }

    // this checks the current users permissions
    const isLead = wbsElement.leadId === currentUser.userId || wbsElement.managerId === currentUser.userId;
    if (!(await userHasPermission(currentUser.userId, organization.organizationId, isAdmin)) && !isLead) {
      throw new AccessDeniedException('Only admin, app-admins, project leads, and project managers can delete tasks');
    }

    const deletedTask = await prisma.task.update({
      where: { taskId },
      data: { dateDeleted: new Date(), deletedByUserId: currentUser.userId }
    });

    return deletedTask.taskId;
  }

  static async getOverdueTasksByTeamLeadership(userId: string, organization: Organization): Promise<TaskCardPreview[]> {
    const teams = await prisma.team.findMany({
      where: {
        organizationId: organization.organizationId,
        OR: [{ leads: { some: { userId } } }, { headId: userId }],
        dateArchived: null
      }
    });

    const tasks = await prisma.task.findMany({
      where: {
        assignees: { some: { userId } },
        deadline: { lt: new Date() },
        status: { not: 'DONE' },
        dateDeleted: null,
        wbsElement: {
          organizationId: organization.organizationId,
          dateDeleted: null,
          OR: [
            { project: { teams: { some: { teamId: { in: teams.map((team) => team.teamId) } } } } },
            {
              workPackage: {
                wbsElement: { project: { teams: { some: { teamId: { in: teams.map((team) => team.teamId) } } } } }
              }
            }
          ]
        }
      },
      ...getTaskPreviewQueryArgs(organization.organizationId)
    });

    return tasks.map(taskCardPreviewTransformer);
  }
}
