import { Prisma } from '@prisma/client';
import { McpTask, wbsPipe } from 'shared';
import { McpTaskQueryArgs } from '../../prisma-query-args/mcp/tasks.query-args.js';
import { wbsNumOf } from '../../utils/utils.js';
import { projectTasksUrl } from '../../utils/urls.utils.js';
import { fullName } from './shared.js';

/**
 * @param task the task to transform
 * @param projectWbsNum the piped wbs number of the project the task belongs to, used for the link
 *                      because the client has no per task route
 */
export const mcpTaskTransformer = (task: Prisma.TaskGetPayload<McpTaskQueryArgs>, projectWbsNum: string): McpTask => {
  return {
    taskId: task.taskId,
    title: task.title,
    notes: task.notes,
    status: task.status,
    priority: task.priority,
    startDate: task.startDate ?? undefined,
    deadline: task.deadline ?? undefined,
    assignees: task.assignees.map((assignee) => `${assignee.firstName} ${assignee.lastName}`),
    labels: task.labels.map((label) => label.name),
    createdBy: fullName(task.createdBy) ?? 'no one',
    // the parent is either the project itself or one of its work packages
    parentWbsNum: wbsPipe(wbsNumOf(task.wbsElement)),
    parentName: task.wbsElement.name,
    viewOnFinishline: projectTasksUrl(projectWbsNum)
  };
};
