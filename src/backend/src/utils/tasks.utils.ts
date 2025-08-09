import { Task_Priority, Task_Status } from '@prisma/client';
import { Task, TaskPriority, TaskStatus } from 'shared';
import prisma from '../prisma/prisma';
import { sendSlackTaskAssignedNotification } from './slack.utils';

export const convertTaskPriority = (priority: Task_Priority): TaskPriority =>
  ({
    LOW: TaskPriority.Low,
    MEDIUM: TaskPriority.Medium,
    HIGH: TaskPriority.High
  })[priority];

export const convertTaskStatus = (status: Task_Status): TaskStatus =>
  ({
    IN_BACKLOG: TaskStatus.IN_BACKLOG,
    IN_PROGRESS: TaskStatus.IN_PROGRESS,
    DONE: TaskStatus.DONE
  })[status];

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
