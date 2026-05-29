import { Task_Priority, Task_Status, Organization } from '@prisma/client';
import {
  CalendarTask,
  FilterTaskArgs,
  isAdmin,
  isUnderWordCount,
  notGuest,
  Task,
  TaskCardPreview,
  TaskLabel,
  WbsNumber,
  wbsPipe,
  User
} from 'shared';
import prisma from '../prisma/prisma.js';
import taskTransformer, {
  calendarTaskTransformer,
  taskCardPreviewTransformer,
  taskLabelTransformer
} from '../transformers/tasks.transformer.js';
import {
  NotFoundException,
  AccessDeniedException,
  HttpException,
  DeletedException,
  InvalidOrganizationException
} from '../utils/errors.utils.js';
import { sendSlackTaskAssignedNotificationToUsers } from '../utils/tasks.utils.js';
import { getUsers, userHasPermission } from '../utils/users.utils.js';
import { wbsNumOf } from '../utils/utils.js';
import { getTeamQueryArgs } from '../prisma-query-args/teams.query-args.js';
import {
  getCalendarTaskQueryArgs,
  getTaskLabelQueryArgs,
  getTaskPreviewQueryArgs,
  getTaskQueryArgs
} from '../prisma-query-args/tasks.query-args.js';
import { getProjectQueryArgs } from '../prisma-query-args/projects.query-args.js';
import { admin } from 'googleapis/build/src/apis/admin/index.js';

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
   * @param startDate the start date of the task
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
        },
        workPackage: {
          include: {
            project: {
              include: {
                teams: getTeamQueryArgs(organization.organizationId)
              }
            }
          }
        }
      }
    });
    if (!requestedWbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
    if (requestedWbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));

    if (!requestedWbsElement.project && !requestedWbsElement.workPackage)
      throw new HttpException(400, "This task's wbs element is not linked to a project or work package!");

    const teams = requestedWbsElement.project?.teams ?? requestedWbsElement.workPackage?.project?.teams;
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

    const nonSelfAssigneeIds = assignees.filter((id) => id !== createdBy.userId);
    await sendSlackTaskAssignedNotificationToUsers(newTask, nonSelfAssigneeIds, organization.organizationId);

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
   * @param startDate the new start date for the task
   * @param deadline the new deadline for the task
   * @param wbsNum the new wbs element for the task
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
    deadline?: Date,
    wbsNum?: WbsNumber
  ) {
    const hasPermission = await userHasPermission(user.userId, organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit tasks');

    const originalTask = await prisma.task.findUnique({ where: { taskId }, include: { wbsElement: true } });

    // error if there's a problem with the task
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Task');
    if (originalTask.dateDeleted) throw new DeletedException('Task', taskId);

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');
    if (!isUnderWordCount(notes, 250)) throw new HttpException(400, 'Notes must be less than 250 words');

    // if wbsNum passed, error if there's a problem with the wbs element
    if (wbsNum) {
      const newWbsElement = await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            ...wbsNum,
            organizationId
          }
        }
      });
      if (!newWbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
      if (newWbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));
    }

    const updatedTask = await prisma.task.update({
      where: { taskId },
      data: {
        title,
        notes,
        priority,
        startDate,
        deadline,
        // if wbsNum passed, update prisma relation to connect task with wbs element
        ...(wbsNum && {
          wbsElement: {
            connect: {
              wbsNumber: {
                ...wbsNum,
                organizationId
              }
            }
          }
        })
      },
      ...getTaskQueryArgs(originalTask.wbsElement.organizationId)
    });
    return taskTransformer(updatedTask);
  }

  /**
   * Edits the status of a task in the database
   * @param user the user editing the task
   * @param organizationId the organization Id
   * @param taskId the id of the task
   * @param status the new status
   * @returns the updated task
   * @throws if the task does not exist, the task is already deleted, or if the user does not have permissions
   */
  static async editTaskStatus(user: User, organizationId: string, taskId: string, status: Task_Status) {
    const hasPermission = await userHasPermission(user.userId, organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit tasks');

    // Get the original task and check if it exists
    const originalTask = await prisma.task.findUnique({ where: { taskId }, include: { assignees: true, wbsElement: true } });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (organizationId !== originalTask.wbsElement.organizationId) throw new InvalidOrganizationException('Task');
    if (originalTask.dateDeleted) throw new DeletedException('Task', taskId);

    if (status === 'IN_PROGRESS' && (!originalTask.deadline || originalTask.assignees.length === 0)) {
      throw new HttpException(400, 'A task in progress must have a deadline and assignees!');
    }

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
    const hasPermission = await userHasPermission(user.userId, organization.organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit tasks');

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

    const nonSelfAssigneeIds = newAssigneeIds.filter((id) => id !== user.userId);
    await sendSlackTaskAssignedNotificationToUsers(updatedTask, nonSelfAssigneeIds, organization.organizationId);

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
    const isCreator = task.createdByUserId === currentUser.userId;
    if (!(await userHasPermission(currentUser.userId, organization.organizationId, isAdmin)) && !isLead && !isCreator) {
      throw new AccessDeniedException(
        'Only admin, app-admins, project leads, project managers, and the task creator can delete tasks'
      );
    }

    const deletedTask = await prisma.task.update({
      where: { taskId },
      data: { dateDeleted: new Date(), deletedByUserId: currentUser.userId }
    });

    return deletedTask.taskId;
  }

  static async getFilteredTasks(filters: FilterTaskArgs, organization: Organization): Promise<CalendarTask[]> {
    const { memberIds, teamIds, startPeriod, endPeriod } = filters;

    // Validate memberIds if provided
    if (memberIds && memberIds.length > 0) {
      const users = await prisma.user.findMany({
        where: { userId: { in: memberIds }, organizations: { some: { organizationId: organization.organizationId } } }
      });
      if (users.length !== memberIds.length) {
        throw new NotFoundException('User', 'one or more member IDs');
      }
    }

    // Validate teamIds if provided
    if (teamIds && teamIds.length > 0) {
      const teams = await prisma.team.findMany({
        where: {
          teamId: { in: teamIds },
          organizationId: organization.organizationId
        }
      });
      if (teams.length !== teamIds.length) {
        throw new NotFoundException('Team', 'one or more team IDs');
      }
    }

    const orFilters: any[] = [];
    if (memberIds && memberIds.length > 0) {
      orFilters.push({ assignees: { some: { userId: { in: memberIds } } } });
      orFilters.push({ createdByUserId: { in: memberIds } });
    }
    if (teamIds && teamIds.length > 0) {
      orFilters.push({
        wbsElement: {
          project: {
            teams: { some: { teamId: { in: teamIds } } }
          }
        }
      });
    }

    const tasks = await prisma.task.findMany({
      where: {
        dateDeleted: null,
        deadline: {
          gte: startPeriod,
          lte: endPeriod
        },
        wbsElement: {
          organizationId: organization.organizationId,
          dateDeleted: null
        },
        ...(orFilters.length > 0 ? { OR: orFilters } : {})
      },
      ...getCalendarTaskQueryArgs(organization.organizationId)
    });

    return tasks.map(calendarTaskTransformer);
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

  /**
   * Gets all tasks associated with a wbs element
   * If the wbs number is a project (workPackageNumber === 0), returns the project's
   * own tasks merged with all of its work packages' tasks
   * If the wbs number is a work package, returns just that WP's tasks
   * @param wbsNum the wbs number to fetch tasks for
   * @param organization the organization that the user is currently in
   * @returns array of tasks
   */
  static async getTasksByWbsNum(wbsNum: WbsNumber, organization: Organization): Promise<Task[]> {
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          ...wbsNum,
          organizationId: organization.organizationId
        }
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
    if (wbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));

    // project case, so return project's own tasks and all its wp's tasks
    if (wbsNum.workPackageNumber === 0) {
      const project = await prisma.project.findUnique({
        where: { wbsElementId: wbsElement.wbsElementId },
        include: { workPackages: { include: { wbsElement: true } } }
      });

      if (!project) throw new NotFoundException('Project', wbsPipe(wbsNum));

      const wpWbsElementIds = project.workPackages.map((wp) => wp.wbsElementId);

      const tasks = await prisma.task.findMany({
        where: {
          dateDeleted: null,
          wbsElementId: { in: [wbsElement.wbsElementId, ...wpWbsElementIds] }
        },
        ...getTaskQueryArgs(organization.organizationId)
      });

      return tasks.map(taskTransformer);
    }

    // work package case, so return just that wp's tasks
    const tasks = await prisma.task.findMany({
      where: {
        dateDeleted: null,
        wbsElementId: wbsElement.wbsElementId
      },
      ...getTaskQueryArgs(organization.organizationId)
    });

    return tasks.map(taskTransformer);
  }

  static async getAllTaskLabels(organization: Organization): Promise<TaskLabel[]> {
    const labels = await prisma.task_Label.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      ...getTaskLabelQueryArgs(organization.organizationId)
    });

    return labels.map(taskLabelTransformer);
  }

  static async createTaskLabel(
    creator: User,
    name: string,
    colorHexCode: string,
    organization: Organization
  ): Promise<TaskLabel> {
    const hasPermission = await userHasPermission(creator.userId, organization.organizationId, isAdmin);
    if (!hasPermission) throw new AccessDeniedException('Non admins cannot create task labels');

    const label = await prisma.task_Label.create({
      data: {
        name,
        colorHexCode,
        userCreated: { connect: { userId: creator.userId } },
        organization: { connect: { organizationId: organization.organizationId } }
      },
      ...getTaskLabelQueryArgs(organization.organizationId)
    });

    return taskLabelTransformer(label);
  }

  static async editTaskLabel(
    user: User,
    taskLabelId: string,
    name: string,
    colorHexCode: string,
    organization: Organization
  ): Promise<TaskLabel> {
    const hasPermission = await userHasPermission(user.userId, organization.organizationId, isAdmin);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit task labels');

    const label = await prisma.task_Label.findUnique({ where: { taskLabelId } });
    if (!label) throw new NotFoundException('Task Label', taskLabelId);
    if (label.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Task Label');
    if (label.dateDeleted) throw new DeletedException('Task Label', taskLabelId);

    const updatedLabel = await prisma.task_Label.update({
      where: { taskLabelId },
      data: { name, colorHexCode },
      ...getTaskLabelQueryArgs(organization.organizationId)
    });

    return taskLabelTransformer(updatedLabel);
  }

  static async deleteTaskLabel(user: User, taskLabelId: string, organization: Organization): Promise<string> {
    const hasPermission = await userHasPermission(user.userId, organization.organizationId, isAdmin);
    if (!hasPermission) throw new AccessDeniedException('Only admins can delete task labels');

    const label = await prisma.task_Label.findUnique({ where: { taskLabelId } });
    if (!label) throw new NotFoundException('Task Label', taskLabelId);
    if (label.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Task Label');
    if (label.dateDeleted) throw new DeletedException('Task Label', taskLabelId);

    await prisma.task_Label.update({
      where: { taskLabelId },
      data: {
        dateDeleted: new Date(),
        userDeleted: { connect: { userId: user.userId } }
      }
    });

    return taskLabelId;
  }
}
