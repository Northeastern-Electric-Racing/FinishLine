import { Prisma, Task_Priority, Task_Status, Organization } from '@prisma/client';
import {
  FilterTaskArgs,
  isAdmin,
  isUnderWordCount,
  notGuest,
  TaskBoardItem,
  TaskBoardItemPage,
  TaskHomeCard,
  TaskLabel,
  WbsNumber,
  wbsPipe,
  User
} from 'shared';
import prisma from '../prisma/prisma.js';
import {
  getActiveTaskBlockerNames,
  taskBlockedByTransformer,
  taskBoardItemTransformer,
  taskHomeCardTransformer,
  taskLabelTransformer
} from '../transformers/tasks.transformer.js';
import {
  NotFoundException,
  AccessDeniedException,
  HttpException,
  DeletedException,
  InvalidOrganizationException
} from '../utils/errors.utils.js';
import {
  sendSlackTaskAssignedNotificationToUsers,
  validateTaskBlockedBys,
  validateTaskLabels
} from '../utils/tasks.utils.js';
import { getUsers, userHasPermission } from '../utils/users.utils.js';
import { wbsNumOf } from '../utils/utils.js';
import {
  getTaskBlockingWorkPackagesQueryArgs,
  getTaskBoardItemQueryArgs,
  getTaskHomeCardQueryArgs,
  getTaskLabelQueryArgs
} from '../prisma-query-args/tasks.query-args.js';

// how many tasks each column of the global tasks board loads at a time
const TASK_BOARD_PAGE_SIZE = 20;

/**
 * Validates the filter criteria and builds the where clause for the tasks matching them. Shared by the full and
 * paginated filter endpoints so both always match exactly the same tasks.
 */
const getFilteredTasksWhere = async (
  filters: FilterTaskArgs,
  organization: Organization
): Promise<Prisma.TaskWhereInput> => {
  const {
    memberIds,
    teamIds,
    startPeriod,
    endPeriod,
    labelIds,
    wbsNum,
    carNumbers,
    projectWbsNums,
    workPackageWbsNums,
    search,
    andMemberTeam
  } = filters;

  // Validate memberIds if provided
  if (memberIds && memberIds.length > 0) {
    const users = await prisma.user.findMany({
      where: { userId: { in: memberIds }, organizations: { some: { organizationId: organization.organizationId } } },
      select: { userId: true }
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
      },
      select: { teamId: true }
    });
    if (teams.length !== teamIds.length) {
      throw new NotFoundException('Team', 'one or more team IDs');
    }
  }

  if (labelIds && labelIds.length > 0) {
    await validateTaskLabels(labelIds, organization.organizationId);
  }

  // Legacy calendar semantics: member and team OR together (and member also matches the task creator).
  const orFilters: any[] = [];
  // Global-page semantics: each filter is its own AND condition, OR-ing only within its own selections.
  const andConditions: any[] = [];

  if (andMemberTeam) {
    if (memberIds && memberIds.length > 0) {
      andConditions.push({ assignees: { some: { userId: { in: memberIds } } } });
    }
    if (teamIds && teamIds.length > 0) {
      // match tasks whose project OR whose work package's project belongs to a selected team
      andConditions.push({
        wbsElement: {
          OR: [
            { project: { teams: { some: { teamId: { in: teamIds } } } } },
            { workPackage: { project: { teams: { some: { teamId: { in: teamIds } } } } } }
          ]
        }
      });
    }
  } else {
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
  }

  if (carNumbers && carNumbers.length > 0) {
    andConditions.push({ wbsElement: { carNumber: { in: carNumbers } } });
  }
  if (projectWbsNums && projectWbsNums.length > 0) {
    andConditions.push({
      wbsElement: {
        OR: projectWbsNums.map((wbs) => ({ carNumber: wbs.carNumber, projectNumber: wbs.projectNumber }))
      }
    });
  }
  if (workPackageWbsNums && workPackageWbsNums.length > 0) {
    andConditions.push({
      wbsElement: {
        OR: workPackageWbsNums.map((wbs) => ({
          carNumber: wbs.carNumber,
          projectNumber: wbs.projectNumber,
          workPackageNumber: wbs.workPackageNumber
        }))
      }
    });
  }
  if (search && search.trim().length > 0) {
    andConditions.push({
      OR: [{ title: { contains: search, mode: 'insensitive' } }, { notes: { contains: search, mode: 'insensitive' } }]
    });
  }

  let wbsElementIds: string[] | undefined;
  if (wbsNum) {
    const wbsElement = await prisma.wBS_Element.findUnique({
      where: { wbsNumber: { ...wbsNum, organizationId: organization.organizationId } },
      select: { wbsElementId: true, dateDeleted: true }
    });
    if (!wbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
    if (wbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));

    if (wbsNum.workPackageNumber === 0) {
      const project = await prisma.project.findUnique({
        where: { wbsElementId: wbsElement.wbsElementId },
        select: { workPackages: { select: { wbsElementId: true } } }
      });
      if (!project) throw new NotFoundException('Project', wbsPipe(wbsNum));
      wbsElementIds = [wbsElement.wbsElementId, ...project.workPackages.map((wp) => wp.wbsElementId)];
    } else {
      wbsElementIds = [wbsElement.wbsElementId];
    }
  }

  return {
    dateDeleted: null,
    ...(startPeriod && endPeriod ? { deadline: { gte: startPeriod, lte: endPeriod } } : {}),
    ...(wbsElementIds ? { wbsElementId: { in: wbsElementIds } } : {}),
    ...(labelIds && labelIds.length > 0 ? { labels: { some: { taskLabelId: { in: labelIds } } } } : {}),
    wbsElement: {
      organizationId: organization.organizationId,
      dateDeleted: null
    },
    ...(orFilters.length > 0 ? { OR: orFilters } : {}),
    ...(andConditions.length > 0 ? { AND: andConditions } : {})
  };
};

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
   * @param labelIds the label ids for the task
   * @param blockedByIds the ids of the tasks that block this task
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
    labelIds: string[],
    blockedByIds: string[],
    startDate?: Date,
    deadline?: Date
  ): Promise<TaskBoardItem> {
    const requestedWbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          ...wbsNum,
          organizationId: organization.organizationId
        }
      },
      select: {
        dateDeleted: true,
        project: { select: { _count: { select: { teams: true } } } },
        workPackage: { select: { project: { select: { _count: { select: { teams: true } } } } } }
      }
    });
    if (!requestedWbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
    if (requestedWbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));

    if (!requestedWbsElement.project && !requestedWbsElement.workPackage)
      throw new HttpException(400, "This task's wbs element is not linked to a project or work package!");

    const numTeams = requestedWbsElement.project?._count.teams ?? requestedWbsElement.workPackage?.project?._count.teams;
    if (numTeams === undefined || numTeams === 0)
      throw new HttpException(400, 'This project needs to be assigned to a team to create a task!');

    if (!(await userHasPermission(createdBy.userId, organization.organizationId, notGuest))) {
      throw new AccessDeniedException('Guests cannot create tasks');
    }

    const users = await getUsers(assignees); // this throws if any of the users aren't found

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');
    if (!isUnderWordCount(notes, 250)) throw new HttpException(400, 'Notes must be less than 250 words');

    if (startDate && deadline && startDate > deadline) {
      throw new HttpException(400, 'Start date must be before or on the same day as the deadline');
    }

    if (status === 'IN_PROGRESS' && (!deadline || assignees.length === 0)) {
      throw new HttpException(400, 'A task in progress must have a deadline and assignees!');
    }

    await validateTaskLabels(labelIds, organization.organizationId);
    const blockedByTasks = await validateTaskBlockedBys(blockedByIds, organization.organizationId);

    // only worth the extra nested fetch when actually attempting to create the task as done
    if (status === 'DONE') {
      const wbsElementForBlockCheck = await prisma.wBS_Element.findUniqueOrThrow({
        where: { wbsNumber: { ...wbsNum, organizationId: organization.organizationId } },
        select: { workPackage: getTaskBlockingWorkPackagesQueryArgs() }
      });
      const blockerNames = getActiveTaskBlockerNames(
        blockedByTasks.map(taskBlockedByTransformer),
        wbsElementForBlockCheck.workPackage
      );
      if (blockerNames.length > 0) {
        throw new HttpException(400, `Cannot create task as done: blocked by ${blockerNames.join(', ')}`);
      }
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
        assignees: { connect: users.map((user) => ({ userId: user.userId })) },
        labels: { connect: labelIds.map((id) => ({ taskLabelId: id })) },
        blockedBy: { connect: blockedByTasks.map((task) => ({ taskId: task.taskId })) }
      },
      ...getTaskBoardItemQueryArgs()
    });

    const newTask = taskBoardItemTransformer(createdTask);

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
   * @param labelIds the new label ids for the task
   * @param blockedByIds the new ids of the tasks that block this task
   * @param startDate the new start date for the task
   * @param deadline the new deadline for the task
   * @param wbsNum the new wbs element for the task
   */
  static async editTask(
    user: User,
    organizationId: string,
    taskId: string,
    title: string,
    notes: string,
    priority: Task_Priority,
    labelIds: string[],
    blockedByIds: string[],
    startDate?: Date,
    deadline?: Date,
    wbsNum?: WbsNumber
  ): Promise<void> {
    const hasPermission = await userHasPermission(user.userId, organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit tasks');

    const originalTask = await prisma.task.findUnique({
      where: { taskId },
      select: { dateDeleted: true, startDate: true, deadline: true, wbsElement: { select: { organizationId: true } } }
    });

    // error if there's a problem with the task
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Task');
    if (originalTask.dateDeleted) throw new DeletedException('Task', taskId);

    if (!isUnderWordCount(title, 15)) throw new HttpException(400, 'Title must be less than 15 words');
    if (!isUnderWordCount(notes, 250)) throw new HttpException(400, 'Notes must be less than 250 words');

    const effectiveStartDate = startDate ?? originalTask.startDate ?? undefined;
    const effectiveDeadline = deadline ?? originalTask.deadline ?? undefined;

    if (effectiveStartDate && effectiveDeadline && effectiveStartDate > effectiveDeadline) {
      throw new HttpException(400, 'Start date must be before or on the same day as the deadline');
    }

    await validateTaskLabels(labelIds, organizationId);
    const blockedByTasks = await validateTaskBlockedBys(blockedByIds, organizationId, taskId);

    // if wbsNum passed, error if there's a problem with the wbs element
    if (wbsNum) {
      const newWbsElement = await prisma.wBS_Element.findUnique({
        where: {
          wbsNumber: {
            ...wbsNum,
            organizationId
          }
        },
        select: { dateDeleted: true }
      });
      if (!newWbsElement) throw new NotFoundException('WBS Element', wbsPipe(wbsNum));
      if (newWbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsPipe(wbsNum));
    }

    await prisma.task.update({
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
        }),
        labels: { set: labelIds.map((id) => ({ taskLabelId: id })) },
        blockedBy: { set: blockedByTasks.map((task) => ({ taskId: task.taskId })) }
      }
    });
  }

  /**
   * Edits the status of a task in the database
   * @param user the user editing the task
   * @param organizationId the organization Id
   * @param taskId the id of the task
   * @param status the new status
   * @throws if the task does not exist, the task is already deleted, or if the user does not have permissions
   */
  static async editTaskStatus(user: User, organizationId: string, taskId: string, status: Task_Status): Promise<void> {
    const hasPermission = await userHasPermission(user.userId, organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit tasks');

    // Get the original task and check if it exists
    const originalTask = await prisma.task.findUnique({
      where: { taskId },
      select: {
        dateDeleted: true,
        deadline: true,
        wbsElement: { select: { organizationId: true } },
        _count: { select: { assignees: true } }
      }
    });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (organizationId !== originalTask.wbsElement.organizationId) throw new InvalidOrganizationException('Task');
    if (originalTask.dateDeleted) throw new DeletedException('Task', taskId);

    if (status === 'IN_PROGRESS' && (!originalTask.deadline || originalTask._count.assignees === 0)) {
      throw new HttpException(400, 'A task in progress must have a deadline and assignees!');
    }

    // Blocked-by is advisory when completing a task: the frontend warns the user about any incomplete
    // blockers (using the blockedBy data already on the task) and only calls this once they confirm, so
    // we intentionally don't reject a blocked task here.

    await prisma.task.update({
      where: { taskId },
      data: { status }
    });
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
  ): Promise<TaskBoardItem> {
    const hasPermission = await userHasPermission(user.userId, organization.organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit tasks');

    // Get the original task and check if it exists
    const originalTask = await prisma.task.findUnique({
      where: { taskId },
      select: {
        dateDeleted: true,
        wbsElement: { select: { organizationId: true } },
        assignees: { select: { userId: true } }
      }
    });
    if (!originalTask) throw new NotFoundException('Task', taskId);
    if (originalTask.wbsElement.organizationId !== organization.organizationId)
      throw new InvalidOrganizationException('Task');
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

    const updatedTask = taskBoardItemTransformer(
      await prisma.task.update({
        where: { taskId },
        data: {
          assignees: {
            set: transformedAssigneeUsers
          }
        },
        ...getTaskBoardItemQueryArgs()
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
   * @throws if the user does not have permission
   */
  static async deleteTask(currentUser: User, taskId: string, organization: Organization): Promise<void> {
    const task = await prisma.task.findUnique({
      where: { taskId },
      select: { dateDeleted: true, wbsElementId: true, createdByUserId: true }
    });
    if (!task) throw new NotFoundException('Task', taskId);
    if (task.dateDeleted) throw new DeletedException('Task', taskId);

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: { wbsElementId: task.wbsElementId },
      select: {
        dateDeleted: true,
        leadId: true,
        managerId: true,
        carNumber: true,
        projectNumber: true,
        workPackageNumber: true
      }
    });
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

    await prisma.task.update({
      where: { taskId },
      data: { dateDeleted: new Date(), deletedByUserId: currentUser.userId }
    });
  }

  static async getFilteredTasks(filters: FilterTaskArgs, organization: Organization): Promise<TaskBoardItem[]> {
    const tasks = await prisma.task.findMany({
      where: await getFilteredTasksWhere(filters, organization),
      ...getTaskBoardItemQueryArgs()
    });

    return tasks.map(taskBoardItemTransformer);
  }

  /**
   * Gets one page of a single status column of the tasks matching the filter criteria, for the global tasks board
   * @param filters the filter criteria
   * @param status the status column to get a page of
   * @param offset how many of the column's tasks come before this page
   * @param organization the organization that the user is currently in
   * @returns the page's tasks, and where the next page starts if there is one
   */
  static async getFilteredTasksPage(
    filters: FilterTaskArgs,
    status: Task_Status,
    offset: number,
    organization: Organization
  ): Promise<TaskBoardItemPage> {
    const tasks = await prisma.task.findMany({
      where: { ...(await getFilteredTasksWhere(filters, organization)), status },
      // the board's own order (compareTasks): soonest deadline first with no deadline last, then highest priority.
      // taskId breaks the remaining ties so consecutive pages never overlap or skip a task
      orderBy: [{ deadline: { sort: 'asc', nulls: 'last' } }, { priority: 'desc' }, { taskId: 'asc' }],
      skip: offset,
      // one extra row says whether there's another page without a separate count query
      take: TASK_BOARD_PAGE_SIZE + 1,
      ...getTaskBoardItemQueryArgs()
    });

    return {
      tasks: tasks.slice(0, TASK_BOARD_PAGE_SIZE).map(taskBoardItemTransformer),
      nextOffset: tasks.length > TASK_BOARD_PAGE_SIZE ? offset + TASK_BOARD_PAGE_SIZE : undefined
    };
  }

  static async getOverdueTasksByTeamLeadership(userId: string, organization: Organization): Promise<TaskHomeCard[]> {
    const teams = await prisma.team.findMany({
      where: {
        organizationId: organization.organizationId,
        OR: [{ leads: { some: { userId } } }, { headId: userId }],
        dateArchived: null
      },
      select: { teamId: true }
    });

    const teamIds = teams.map((team) => team.teamId);

    // every overdue task on a project (or one of its work packages) that belongs to one of the user's teams
    const tasks = await prisma.task.findMany({
      where: {
        deadline: { lt: new Date() },
        status: { not: 'DONE' },
        dateDeleted: null,
        wbsElement: {
          organizationId: organization.organizationId,
          dateDeleted: null,
          OR: [
            { project: { teams: { some: { teamId: { in: teamIds } } } } },
            { workPackage: { project: { teams: { some: { teamId: { in: teamIds } } } } } }
          ]
        }
      },
      ...getTaskHomeCardQueryArgs()
    });

    return tasks.map(taskHomeCardTransformer);
  }

  /**
   * Gets all task labels in the database for a given organization
   * @param organization the organization that the user is currently in
   * @returns array of task labels
   */
  static async getAllTaskLabels(organization: Organization): Promise<TaskLabel[]> {
    const labels = await prisma.task_Label.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      ...getTaskLabelQueryArgs()
    });

    return labels.map(taskLabelTransformer);
  }

  /**
   * Creates a task label in the database
   * @param creator the user creating the task label
   * @param name the name of the task label
   * @param colorHexCode the hex code for the task label color
   * @param organization the organization that the user is currently in
   * @returns the created task label
   * @throws if the user does not have permission
   */
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
      ...getTaskLabelQueryArgs()
    });

    return taskLabelTransformer(label);
  }

  /**
   * Edits a task label in the database
   * @param user the user creating the task label
   * @param taskLabelId the id of the task label being edited
   * @param name the name of the task label
   * @param colorHexCode the hex code for the task label color
   * @param organization the organization that the user is currently in
   * @throws if the user does not have permission
   */
  static async editTaskLabel(
    user: User,
    taskLabelId: string,
    name: string,
    colorHexCode: string,
    organization: Organization
  ): Promise<void> {
    const hasPermission = await userHasPermission(user.userId, organization.organizationId, isAdmin);
    if (!hasPermission) throw new AccessDeniedException('Guests cannot edit task labels');

    const label = await prisma.task_Label.findUnique({
      where: { taskLabelId },
      select: { organizationId: true, dateDeleted: true }
    });
    if (!label) throw new NotFoundException('Task Label', taskLabelId);
    if (label.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Task Label');
    if (label.dateDeleted) throw new DeletedException('Task Label', taskLabelId);

    await prisma.task_Label.update({
      where: { taskLabelId },
      data: { name, colorHexCode }
    });
  }

  /**
   * Deletes a task label in the database
   * @param user the user creating the task label
   * @param taskLabelId the id of the task label being deleted
   * @param organization the organization that the user is currently in
   * @throws if the user does not have permission
   */
  static async deleteTaskLabel(user: User, taskLabelId: string, organization: Organization): Promise<void> {
    const hasPermission = await userHasPermission(user.userId, organization.organizationId, isAdmin);
    if (!hasPermission) throw new AccessDeniedException('Only admins can delete task labels');

    const label = await prisma.task_Label.findUnique({
      where: { taskLabelId },
      select: { organizationId: true, dateDeleted: true }
    });
    if (!label) throw new NotFoundException('Task Label', taskLabelId);
    if (label.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Task Label');
    if (label.dateDeleted) throw new DeletedException('Task Label', taskLabelId);

    await prisma.task_Label.update({
      where: { taskLabelId },
      data: {
        dateDeleted: new Date(),
        userDeleted: { connect: { userId: user.userId } },
        tasks: { set: [] }
      }
    });
  }
}
