import { Task_Priority, Task_Status, User } from '@prisma/client';
import { isHead, Task, TaskPriority, TaskStatus } from 'shared';
import prisma from '../prisma/prisma';
import { sendSlackTaskAssignedNotification } from './slack.utils';
import { userHasPermission } from './users.utils';

export const convertTaskPriority = (priority: Task_Priority): TaskPriority =>
  ({
    LOW: TaskPriority.Low,
    MEDIUM: TaskPriority.Medium,
    HIGH: TaskPriority.High
  }[priority]);

export const convertTaskStatus = (status: Task_Status): TaskStatus =>
  ({
    IN_BACKLOG: TaskStatus.IN_BACKLOG,
    IN_PROGRESS: TaskStatus.IN_PROGRESS,
    DONE: TaskStatus.DONE
  }[status]);

export const hasPermissionToEditTask = async (user: User, taskId: string): Promise<boolean> => {
  const task = await prisma.task.findUnique({
    where: { taskId },
    include: {
      assignees: true,
      wbsElement: {
        include: {
          project: {
            include: {
              teams: {
                include: {
                  members: true,
                  leads: true
                }
              }
            }
          },
          workPackage: {
            include: {
              project: {
                include: {
                  teams: {
                    include: {
                      members: true,
                      leads: true
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!task) return false;

  if (await userHasPermission(user.userId, task.wbsElement.organizationId, isHead)) return true;

  // Check if the user created the task
  if (task.createdByUserId === user.userId) return true;

  // Check if the task's wbsElement's lead or manager created the task
  if (task.wbsElement.leadId === user.userId) return true;
  if (task.wbsElement.managerId === user.userId) return true;

  // Check if the user is one of the assignees
  if (task.assignees.map((user) => user.userId).includes(user.userId)) return true;

  // Check if the user is a project head, lead or on one of the project's teams
  if (
    task.wbsElement.project?.teams.map((team) => team.headId).includes(user.userId) ||
    task.wbsElement.project?.teams.some((team) => team.leads.map((lead) => lead.userId).includes(user.userId))
  )
    return true;

  // Do the same thing, but for the work package's project
  if (
    task.wbsElement.workPackage?.project?.teams.map((team) => team.headId).includes(user.userId) ||
    task.wbsElement.workPackage?.project?.teams.some((team) => team.leads.map((lead) => lead.userId).includes(user.userId))
  )
    return true;

  return false;
};

/**
 * Sends a task assigned notification to the specified users on Slack
 * @param task the task the users are assigned to
 * @param assigneeIds the user ids of the users assigned to the task
 * @param orgainzationId the organization id of the current user
 */
export const sendSlackTaskAssignedNotificationToUsers = async (
  task: Task,
  assigneeIds: string[],
  orgainzationId: string
) => {
  const assigneeSettings = await prisma.user_Settings.findMany({ where: { userId: { in: assigneeIds } } });
  assigneeSettings.forEach(async (settings) => {
    if (settings.slackId) {
      await sendSlackTaskAssignedNotification(settings.slackId, task, orgainzationId);
    }
  });
};
