import * as z from 'zod/v4';
import TasksService from '../services/tasks.services.js';
import { paginate, parseProjectWbsNum } from '../utils/agent.utils.js';
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
        'team is keeping up with its work. A busy project has many tasks, so results come back a page ' +
        'at a time: total is how many the project has, and nextOffset is present only while more remain. ' +
        'Page through them all before answering a question that counts or totals tasks.',
      inputSchema: z.object({ wbsNum: wbsNumSchema, offset: offsetSchema('tasks') })
    },
    async ({ wbsNum, offset }) =>
      withToolErrors(LIST_PROJECTS_HINT, async () => {
        const tasks = await TasksService.getFilteredTasks({ wbsNum: parseProjectWbsNum(wbsNum) }, organization);
        // the service does not order its results, and paging needs the same order on every call
        tasks.sort((a, b) => a.taskId.localeCompare(b.taskId));
        const { items, ...page } = paginate(tasks, offset);

        return { tasks: items, ...page };
      })
  );
};
