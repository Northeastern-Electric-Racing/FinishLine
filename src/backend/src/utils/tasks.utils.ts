import { Task_Priority, Task_Status } from '@prisma/client';
import { Task, TaskPriority, TaskStatus } from 'shared';
import prisma from '../prisma/prisma.js';
import { sendSlackTaskAssignedNotification } from './slack.utils.js';
import { DeletedException, HttpException, InvalidOrganizationException, NotFoundException } from './errors.utils.js';

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
 * Checks whether connecting taskId as blockedBy each of blockedByIds would create a cycle, i.e. whether
 * taskId is already reachable by walking the blockedBy chain starting from any of blockedByIds (meaning
 * one of them already (transitively) depends on taskId).
 */
const wouldCreateBlockingCycle = async (taskId: string, blockedByIds: string[]): Promise<boolean> => {
  const visited = new Set<string>();
  const queue = [...blockedByIds];

  while (queue.length > 0) {
    const currentId = queue.pop()!;
    if (currentId === taskId) return true;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const current = await prisma.task.findUnique({
      where: { taskId: currentId },
      select: { blockedBy: { select: { taskId: true } } }
    });
    if (current) queue.push(...current.blockedBy.map((blocker) => blocker.taskId));
  }

  return false;
};

/**
 * Validates that all given task IDs exist, are not deleted, and belong to the given organization.
 * @param blockedByIds the task ids that would block the task
 * @param organizationId the organization the blocking tasks must belong to
 * @param taskId the id of the task being blocked, if it already exists (omitted on create)
 * @throws NotFoundException if any ID doesn't exist
 * @throws DeletedException if any blocking task is soft-deleted
 * @throws InvalidOrganizationException if any blocking task belongs to a different organization
 * @throws HttpException if a task is listed as blocking itself, or if the change would create a blocking cycle
 */
export const validateTaskBlockedBys = async (blockedByIds: string[], organizationId: string, taskId?: string) => {
  if (blockedByIds.length === 0) return [];

  if (taskId && blockedByIds.includes(taskId)) {
    throw new HttpException(400, 'A task cannot block itself');
  }

  const blockedByTasks = await prisma.task.findMany({
    where: { taskId: { in: blockedByIds } },
    include: { wbsElement: true }
  });

  const foundIds = blockedByTasks.map((t) => t.taskId);
  const missingIds = blockedByIds.filter((id) => !foundIds.includes(id));
  if (missingIds.length > 0) throw new NotFoundException('Task', missingIds.join(', '));

  const deletedTask = blockedByTasks.find((t) => t.dateDeleted !== null);
  if (deletedTask) throw new DeletedException('Task', deletedTask.taskId);

  const wrongOrgTask = blockedByTasks.find((t) => t.wbsElement.organizationId !== organizationId);
  if (wrongOrgTask) throw new InvalidOrganizationException('Task');

  if (taskId && (await wouldCreateBlockingCycle(taskId, blockedByIds))) {
    throw new HttpException(400, 'This would create a circular blocking dependency');
  }

  return blockedByTasks;
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
