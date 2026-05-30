import { Task_Priority, Task_Status } from '@prisma/client';
import { Task, TaskPriority, TaskStatus } from 'shared';
import prisma from '../prisma/prisma.js';
import { sendSlackTaskAssignedNotification } from './slack.utils.js';
import { DeletedException, InvalidOrganizationException, NotFoundException } from './errors.utils.js';

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
 * Validates that all given label IDs exist, are not deleted, and belong to the given organization.
 * @throws NotFoundException if any ID doesn't exist
 * @throws DeletedException if any label is soft-deleted
 * @throws InvalidOrganizationException if any label belongs to a different organization
 */
export const validateTaskLabels = async (labelIds: string[], organizationId: string): Promise<void> => {
  if (labelIds.length === 0) return;

  const labels = await prisma.task_Label.findMany({ where: { taskLabelId: { in: labelIds } } });

  const foundIds = labels.map((l) => l.taskLabelId);
  const missingIds = labelIds.filter((id) => !foundIds.includes(id));
  if (missingIds.length > 0) throw new NotFoundException('Task Label', missingIds.join(', '));

  const deletedLabel = labels.find((l) => l.dateDeleted !== null);
  if (deletedLabel) throw new DeletedException('Task Label', deletedLabel.taskLabelId);

  const wrongOrgLabel = labels.find((l) => l.organizationId !== organizationId);
  if (wrongOrgLabel) throw new InvalidOrganizationException('Task Label');
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
