import * as z from 'zod/v4';
import { Task_Status } from '@prisma/client';
import { validateWBS } from 'shared';
import TasksService from '../services/tasks.services.js';
import { withToolErrors } from './errors.js';
import { LIST_PROJECTS_HINT, offsetSchema, registerReadOnlyTool, ToolRegistrar, wbsNumSchema } from './tools.utils.js';

export const registerTaskTools: ToolRegistrar = (server, { organization }) => {
  registerReadOnlyTool(
    server,
    'finishline_get_tasks',
    {
      title: 'Get tasks',
      description:
        'List the tasks for a project. Tasks are smaller items of work than work packages, with a ' +
        'status (IN_BACKLOG, IN_PROGRESS, DONE), a priority, an optional deadline, and assignees. ' +
        'This includes tasks attached directly to the project and tasks attached to any of its work ' +
        "packages; each task's wbsNum and wbsName say which. Use this to answer questions about how a " +
        'team is keeping up with its work. Tasks come back soonest deadline first, a page at a time, and ' +
        'nextOffset is present only while more remain. Pass status to only see one status, and page ' +
        'through them all before answering a question that counts or totals tasks.',
      inputSchema: z.object({
        wbsNum: wbsNumSchema,
        status: z.enum(Task_Status).optional().describe('Only return tasks with this status. Omit this for every status.'),
        offset: offsetSchema('tasks')
      })
    },
    async ({ wbsNum, status, offset = 0 }) =>
      withToolErrors(LIST_PROJECTS_HINT, async () =>
        TasksService.getFilteredTasksPage({ wbsNum: validateWBS(wbsNum) }, status, offset, organization)
      )
  );
};
