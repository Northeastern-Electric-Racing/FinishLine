import { Task_Priority, Task_Status, User } from '@prisma/client';
import { isAdmin, isLeadership, isUnderWordCount, Task, WbsNumber, wbsPipe } from 'shared';
import projectQueryArgs from '../prisma-query-args/projects.query-args';
import taskQueryArgs from '../prisma-query-args/tasks.query-args';
import teamQueryArgs from '../prisma-query-args/teams.query-args';
import prisma from '../prisma/prisma';
import taskTransformer from '../transformers/tasks.transformer';
import { NotFoundException, AccessDeniedException, HttpException, DeletedException } from '../utils/errors.utils';
import { hasPermissionToEditTask, sendSlackTaskAssignedNotificationToUsers } from '../utils/tasks.utils';
import { areUsersPartOfTeams, isUserOnTeam } from '../utils/teams.utils';
import { getUsers } from '../utils/users.utils';
import { wbsNumOf } from '../utils/utils';

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
    const requestedWbsElement = await prisma.wBS_Element.findUnique({
      where: { wbsNumber: wbsNum },
      include: {
        project: {
          include: { teams: { ...teamQueryArgs }, wbsElement: true, workPackages: { include: { wbsElement: true } } }
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

    const isProjectLeadOrManager =
      createdBy.userId === requestedWbsElement.projectLeadId || createdBy.userId === requestedWbsElement.projectManagerId;

    const curWorkPackages = project.workPackages;

    const isWorkPackageLeadOrManager = curWorkPackages.some((workPackage) => {
      return (
        workPackage.wbsElement.projectLeadId === createdBy.userId ||
        workPackage.wbsElement.projectManagerId === createdBy.userId
      );
    });

    if (
      !isLeadership(createdBy.role) &&
      !isProjectLeadOrManager &&
      !isWorkPackageLeadOrManager &&
      !teams.some((team) => isUserOnTeam(team, createdBy))
    ) {
      throw new AccessDeniedException(
        'Only admins, app-admins, project leads, project managers, work package leads, work package managers, or current team users can create tasks'
      );
    }

    const users = await getUsers(assignees); // this throws if any of the users aren't found

    if (!areUsersPartOfTeams(teams, users))
      throw new HttpException(400, `All assignees must be part of one of the project's team!`);

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');
    if (!isUnderWordCount(notes, 250)) throw new HttpException(400, 'Notes must be less than 250 words');

    const createdTask = await prisma.task.create({
      data: {
        wbsElement: { connect: { wbsNumber: wbsNum } },
        title,
        notes,
        deadline,
        priority,
        status,
        createdBy: { connect: { userId: createdBy.userId } },
        assignees: { connect: users.map((user) => ({ userId: user.userId })) }
      },
      ...taskQueryArgs
    });

    const newTask = taskTransformer(createdTask);

    sendSlackTaskAssignedNotificationToUsers(newTask, assignees);

    return newTask;
  }

  /**
   * Edits a Task in the database
   * @param user the user editing the task
   * @param taskId the task that is being edited
   * @param title the new title for the task
   * @param notes the new notes for the task
   * @param priority the new priority for the task
   * @param deadline the new deadline for the task
   * @returns the sucessfully edited task
   */
  static async editTask(user: User, taskId: string, title: string, notes: string, priority: Task_Priority, deadline: Date) {
    const hasPermission = await hasPermissionToEditTask(user, taskId);
    if (!hasPermission)
      throw new AccessDeniedException(
        'Only admins, app admins, heads, task creators, project leads, project managers, or project assignees can edit a task'
      );

    const originalTask = await prisma.task.findUnique({ where: { taskId } });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.dateDeleted) throw new DeletedException('Task', taskId);

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');

    if (!isUnderWordCount(notes, 250)) throw new HttpException(400, 'Notes must be less than 250 words');

    const updatedTask = await prisma.task.update({
      where: { taskId },
      data: { title, notes, priority, deadline },
      ...taskQueryArgs
    });
    return taskTransformer(updatedTask);
  }

  /**
   * Edits the status of a task in the database
   * @param user the user editing the task
   * @param taskId the id of the task
   * @param status the new status
   * @returns the updated task
   * @throws if the task does not exist, the task is already deleted, or if the user does not have permissions
   */
  static async editTaskStatus(user: User, taskId: string, status: Task_Status) {
    // Get the original task and check if it exists
    const originalTask = await prisma.task.findUnique({ where: { taskId } });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.dateDeleted) throw new DeletedException('Task', taskId);

    const hasPermission = await hasPermissionToEditTask(user, taskId);
    if (!hasPermission)
      throw new AccessDeniedException(
        'Only admins, app admins, heads, task creators, project leads, project managers, or project assignees can edit a task'
      );

    const updatedTask = await prisma.task.update({ where: { taskId }, data: { status }, ...taskQueryArgs });
    return taskTransformer(updatedTask);
  }

  /**
   * Edits the assignees of a task in the database
   * @param user the user editing the task
   * @param taskId the id of the task
   * @param assignees the new assignees
   * @returns the updated task
   * @throws if the task does not exist, the task is already deleted, any of the assignees don't exist, or if the user does not have permissions
   */
  static async editTaskAssignees(user: User, taskId: string, assignees: number[]): Promise<Task> {
    // Get the original task and check if it exists
    const originalTask = await prisma.task.findUnique({
      where: { taskId },
      include: {
        wbsElement: { include: { project: { ...projectQueryArgs } } },
        assignees: true
      }
    });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.dateDeleted) throw new DeletedException('Task', taskId);

    const originalAssigneeIds = originalTask.assignees.map((assignee) => assignee.userId);
    const newAssigneeIds = assignees.filter((userId) => !originalAssigneeIds.includes(userId));

    const hasPermission = await hasPermissionToEditTask(user, taskId);
    if (!hasPermission)
      throw new AccessDeniedException(
        'Only admins, app admins, heads, task creators, project leads, project managers, or project assignees can edit a task'
      );

    // this throws if any of the users aren't found
    const assigneeUsers = await getUsers(assignees);

    const teams = originalTask.wbsElement?.project?.teams;
    if (!teams || teams.length === 0)
      throw new HttpException(400, 'This project needs to be assigned to a team to create a task!');

    // checks if there is a user that does not belong on any team of the project
    if (!areUsersPartOfTeams(teams, assigneeUsers)) {
      throw new HttpException(400, "All assignees must be part of one of the project's teams");
    }

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
        ...taskQueryArgs
      })
    );

    await sendSlackTaskAssignedNotificationToUsers(updatedTask, newAssigneeIds);

    return updatedTask;
  }

  /**
   * Delete task in the database
   * @param taskId the id number of the given task
   * @param currentUser the current user currently accessing the task
   * @returns the deleted task
   * @throws if the user does not have permission
   */
  static async deleteTask(currentUser: User, taskId: string): Promise<string> {
    const task = await prisma.task.findUnique({ where: { taskId }, ...taskQueryArgs });
    if (!task) throw new NotFoundException('Task', taskId);
    if (task.dateDeleted) throw new DeletedException('Task', taskId);

    const wbsElement = await prisma.wBS_Element.findUnique({ where: { wbsElementId: task.wbsElementId } });
    if (!wbsElement) throw new NotFoundException('WBS Element', task.wbsElementId);
    if (wbsElement.dateDeleted) {
      const wbsNum = wbsNumOf(wbsElement);
      throw new DeletedException('WBS Element', wbsPipe(wbsNum));
    }

    // this checks the current users permissions
    const isLead = wbsElement.projectLeadId === currentUser.userId || wbsElement.projectManagerId === currentUser.userId;
    if (!isAdmin(currentUser.role) && !isLead) {
      throw new AccessDeniedException('Only admin, app-admins, project leads, and project managers can delete tasks');
    }

    const deletedTask = await prisma.task.update({
      where: { taskId },
      data: { dateDeleted: new Date(), deletedByUserId: currentUser.userId }
    });

    return deletedTask.taskId;
  }
}
