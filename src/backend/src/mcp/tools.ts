import { Organization, Task_Priority, Task_Status } from '@prisma/client';
import { CallToolResult, McpServer } from '@modelcontextprotocol/server';
import * as z from 'zod/v4';
import { User } from 'shared';
import McpService from '../services/mcp.services.js';
import { withToolErrors } from './errors.js';

/** The authenticated caller a server instance is built for. */
export interface AgentContext {
  user: User;
  organization: Organization;
}

/**
 * Shared explanation of WBS numbering. The model has no prior knowledge of this scheme, and the
 * tool description is the only place it can learn it.
 */
const WBS_NUM_DESCRIPTION =
  'A project WBS number, formatted "car.project.work_package" — for example "1.2.0". The third component is ' +
  'always 0 for a project; something like "1.2.3" is a work package inside that project, not a ' +
  'project, and will be rejected. Get valid numbers from finishline_list_projects.';

const LIST_PROJECTS_HINT = 'Call finishline_list_projects to see the valid WBS numbers.';
const PROJECT_MEMBERS_HINT = 'Call finishline_get_project_members to see who is on that project\'s team and can be assigned to tasks.';
const GET_TASKS_HINT = 'Call finishline_get_tasks to find valid task ids.';

/** How people appear in every response, so the model knows where a userId for the write tools comes from. */
const PEOPLE_DESCRIPTION = 'People are returned as { userId, name }.';

/**
 * The shape a WBS number has to have. The caller here is a model turning free text into arguments,
 * so it will happily send "1.2" or the project's name. Enforcing the shape in the schema means the
 * framework rejects those with a validation error naming the field, which the model can act on,
 * rather than the string reaching the service. validateWBS parses each section with parseInt, so
 * without this something like "1abc.2.0" would be quietly read as 1.2.0 instead of refused.
 */
const wbsNumSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+$/, 'WBS number must be three numbers separated by dots, like "1.2.0"')
  .describe(WBS_NUM_DESCRIPTION);

/**
 * An ISO calendar date. Same reasoning as the WBS number: a model will send "next Monday" if the
 * schema lets it, and an unparseable date is far cheaper to reject here than downstream.
 * @param description what the date means, for the model
 */
const isoDateSchema = (description: string) =>
  z.iso.date('Date must be an ISO date, such as "2026-09-01".').describe(description);

/**
 * The offset into a paged list. Only the two tools whose lists can outgrow a page take one; the
 * response carries a nextOffset to feed back in, so the model never has to work the arithmetic out.
 * @param items what is being paged, for the model
 */
const offsetSchema = (items: string) =>
  z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      `How many ${items} to skip. Omit this for the first page, then pass the nextOffset from the ` +
        'previous response to get the next one. A response with no nextOffset is the last page.'
    );

/**
 * The user ids to assign a task to. Enforcing an array of strings means a model that sends names
 * instead gets a validation error, and the description points it at where real ids come from.
 * @param description what the list means, for the model
 */
const assigneeIdsSchema = (description: string) =>
  z.array(z.string().min(1)).optional().describe(`${description} ${PROJECT_MEMBERS_HINT}`);

const taskTitleSchema = z.string().trim().min(1).describe('A short title for the task, 15 words or fewer.');
const taskNotesSchema = z.string().describe('Longer notes on the task, 250 words or fewer.');
const taskPrioritySchema = z.enum(Task_Priority).describe('How urgent the task is.');
const taskStatusSchema = z
  .enum(Task_Status)
  .describe('Where the task is. A task can only be IN_PROGRESS once it has a deadline and at least one assignee.');

/**
 * Registers a read only tool.
 *
 * The /mcp endpoint accepts POST (JSON-RPC requires it) so it cannot sit behind the readOnlyGuard
 * the /agent router uses. Every tool is registered through either this or registerWriteTool so that
 * whether a tool writes is declared in one place and visible to the client.
 *
 * @param server the server to register on
 * @param name the tool name the model calls
 * @param config the tool's title, description, and input schema
 * @param handler the tool implementation
 */
const registerReadOnlyTool = <Shape extends z.ZodRawShape>(
  server: McpServer,
  name: string,
  config: { title: string; description: string; inputSchema: z.ZodObject<Shape> },
  handler: (args: z.infer<z.ZodObject<Shape>>) => Promise<CallToolResult>
): void => {
  server.registerTool(name, { ...config, annotations: { readOnlyHint: true } }, handler);
};

/**
 * Registers a tool that writes.
 *
 * Nothing about the token restricts writes: it acts as its user, so each write tool's service
 * method is responsible for checking that this user may make the change. Write tools create and
 * update but never delete, so they are marked non destructive.
 *
 * @param server the server to register on
 * @param name the tool name the model calls
 * @param config the tool's title, description, and input schema
 * @param handler the tool implementation
 */
const registerWriteTool = <Shape extends z.ZodRawShape>(
  server: McpServer,
  name: string,
  config: { title: string; description: string; inputSchema: z.ZodObject<Shape> },
  handler: (args: z.infer<z.ZodObject<Shape>>) => Promise<CallToolResult>
): void => {
  server.registerTool(
    name,
    { ...config, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false } },
    handler
  );
};

/**
 * Builds a FinishLine MCP server for one authenticated caller. Called once per request, so nothing
 * here is shared between callers.
 * @param context the authenticated user and their organization
 */
export const buildMcpServer = (context: AgentContext): McpServer => {
  const server = new McpServer({ name: 'finishline', version: '1.0.0' });
  const { user, organization } = context;

  registerReadOnlyTool(
    server,
    'finishline_list_projects',
    {
      title: 'List projects',
      description:
        'List the projects on a car, with their names, WBS numbers, and one-line summaries. Start ' +
        'here when the user names a project in words rather than by number, then match the name to ' +
        'a WBS number and use the other tools. Cars are identified by a number and are consecutive. ' +
        'Omit carNumber to use the newest car, which is almost always what the user means; the response ' +
        'reports which car number was actually used. Results come back a page at a time: total is how ' +
        'many the car has, and nextOffset is present only while more remain.',
      inputSchema: z.object({
        carNumber: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe('Which car to list projects for. Omit this to use the newest car.'),
        offset: offsetSchema('projects')
      })
    },
    async ({ carNumber, offset }) => withToolErrors('', async () => McpService.getProjects(organization, carNumber, offset))
  );

  registerReadOnlyTool(
    server,
    'finishline_get_project',
    {
      title: 'Get project details',
      description:
        'Get the core details of one project: its status, budget, lead and manager, teams, links, ' +
        'start and end dates, and how many work packages it has. The dates and the status are ' +
        "derived from the project's work packages, so a project with no work packages is inactive " +
        'and has no dates. Use finishline_get_work_packages for the schedule detail behind these dates. ' +
        PEOPLE_DESCRIPTION,
      inputSchema: z.object({ wbsNum: wbsNumSchema })
    },
    async ({ wbsNum }) => withToolErrors(LIST_PROJECTS_HINT, async () => McpService.getProject(wbsNum, organization))
  );

  registerReadOnlyTool(
    server,
    'finishline_get_work_packages',
    {
      title: 'Get work packages',
      description:
        'List the work packages of a project. Work packages are the scheduled phases of ' +
        'a project: each has a start date, a duration in weeks, an end date, a status (INACTIVE, ' +
        'ACTIVE, or COMPLETE), a stage, and description bullets grouped by type — typically ' +
        '"Deliverables" and "Expected Activities", though an organization can rename these. ' +
        "To judge whether a project is behind schedule, compare each work package's end date and " +
        "status against today's date: a work package whose end date has passed but whose status is " +
        'not COMPLETE is late. blockedBy lists the WBS numbers that must finish first. ' +
        PEOPLE_DESCRIPTION,
      inputSchema: z.object({ wbsNum: wbsNumSchema })
    },
    async ({ wbsNum }) => withToolErrors(LIST_PROJECTS_HINT, async () => McpService.getWorkPackages(wbsNum, organization))
  );

  registerReadOnlyTool(
    server,
    'finishline_get_tasks',
    {
      title: 'Get tasks',
      description:
        'List the tasks for a project. Tasks are smaller items of work than work packages, with a ' +
        'status (IN_BACKLOG, IN_PROGRESS, DONE), a priority, an optional deadline, and assignees. ' +
        'This includes tasks attached directly to the project and tasks attached to any of its work ' +
        'packages; parentWbsNum and parentName say which. Use this to answer questions about how a ' +
        'team is keeping up with its work. A busy project has many tasks, so results come back a page ' +
        'at a time: total is how many the project has, and nextOffset is present only while more remain. ' +
        'Page through them all before answering a question that counts or totals tasks. ' +
        PEOPLE_DESCRIPTION,
      inputSchema: z.object({ wbsNum: wbsNumSchema, offset: offsetSchema('tasks') })
    },
    async ({ wbsNum, offset }) =>
      withToolErrors(LIST_PROJECTS_HINT, async () => McpService.getTasks(wbsNum, organization, offset))
  );

  registerReadOnlyTool(
    server,
    'finishline_get_project_members',
    {
      title: 'Get project members',
      description:
        "List the teams working on a project and everyone on them: each team's head, leads, and " +
        "members. These are exactly the people who can be assigned the project's tasks, so call this " +
        'before creating or reassigning a task and use their userIds. ' +
        PEOPLE_DESCRIPTION,
      inputSchema: z.object({ wbsNum: wbsNumSchema })
    },
    async ({ wbsNum }) => withToolErrors(LIST_PROJECTS_HINT, async () => McpService.getProjectMembers(wbsNum, organization))
  );

  registerReadOnlyTool(
    server,
    'finishline_get_events',
    {
      title: 'Get calendar events',
      description:
        'List the calendar events scheduled in a date range, across every calendar in the ' +
        'organization. Each event reports the calendars it appears on, its type, its teams, and its ' +
        'scheduled times. A recurring event is returned once with only the occurrences that fall ' +
        'inside the requested range, and recurring is true when it repeats outside that range too. ' +
        'The range cannot be wider than 7 days; ask for one week at a time.',
      inputSchema: z.object({
        startDate: isoDateSchema('Start of the range, as an ISO date such as "2026-09-01".'),
        endDate: isoDateSchema(
          'End of the range, as an ISO date. Must be on or after startDate and no more than 7 days later.'
        )
      })
    },
    async ({ startDate, endDate }) =>
      withToolErrors('Split the request into one week at a time.', async () =>
        McpService.getEvents(new Date(startDate), new Date(endDate), organization)
      )
  );

  registerWriteTool(
    server,
    'finishline_create_task',
    {
      title: 'Create task',
      description:
        'Create a task on a project, acting as the user this connection belongs to. Only heads, ' +
        "admins, and members of the project's teams can create tasks, and every assignee must be on " +
        'one of those teams; use finishline_get_project_members to find them. Returns the new task. ' +
        'Confirm the details with the user before calling this.',
      inputSchema: z.object({
        wbsNum: wbsNumSchema,
        title: taskTitleSchema,
        notes: taskNotesSchema.optional(),
        priority: taskPrioritySchema,
        status: taskStatusSchema.optional().describe('Where the task starts. Omit this to put it in the backlog.'),
        assigneeIds: assigneeIdsSchema('The userIds of the people to assign.'),
        startDate: isoDateSchema('When work on the task starts, as an ISO date.').optional(),
        deadline: isoDateSchema('When the task is due, as an ISO date. Must be on or after startDate.').optional()
      })
    },
    async ({ wbsNum, startDate, deadline, ...fields }) =>
      withToolErrors(`${LIST_PROJECTS_HINT} ${PROJECT_MEMBERS_HINT}`, async () =>
        McpService.createTask(user, organization, wbsNum, {
          ...fields,
          startDate: startDate ? new Date(startDate) : undefined,
          deadline: deadline ? new Date(deadline) : undefined
        })
      )
  );

  registerWriteTool(
    server,
    'finishline_update_task',
    {
      title: 'Update task',
      description:
        'Update a task, acting as the user this connection belongs to. Only give the fields to ' +
        'change; anything omitted is left as it is. assigneeIds replaces the whole list of assignees, ' +
        "so include anyone who should stay assigned, and every assignee must be on one of the project's " +
        'teams. Only heads, admins, and whoever created the task can update it. Returns the updated ' +
        'task. Confirm the change with the user before calling this.',
      inputSchema: z.object({
        taskId: z.string().min(1).describe(`The id of the task to update. ${GET_TASKS_HINT}`),
        title: taskTitleSchema.optional(),
        notes: taskNotesSchema.optional(),
        priority: taskPrioritySchema.optional(),
        status: taskStatusSchema.optional(),
        assigneeIds: assigneeIdsSchema('The userIds of everyone who should be assigned, replacing the current list.'),
        startDate: isoDateSchema('When work on the task starts, as an ISO date.').optional(),
        deadline: isoDateSchema('When the task is due, as an ISO date. Must be on or after startDate.').optional()
      })
    },
    async ({ taskId, startDate, deadline, ...fields }) =>
      withToolErrors(`${GET_TASKS_HINT} ${PROJECT_MEMBERS_HINT}`, async () =>
        McpService.updateTask(user, organization, taskId, {
          ...fields,
          startDate: startDate ? new Date(startDate) : undefined,
          deadline: deadline ? new Date(deadline) : undefined
        })
      )
  );

  return server;
};
