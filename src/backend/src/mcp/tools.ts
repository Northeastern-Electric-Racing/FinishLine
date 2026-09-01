import { Organization } from '@prisma/client';
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
 * Registers a read only tool.
 *
 * Every tool goes through here, and readOnlyHint is set in one place rather than per tool. The /mcp
 * endpoint accepts POST (JSON-RPC requires it) so it cannot sit behind the readOnlyGuard the /agent
 * router uses; this is what keeps the endpoint read only instead. Adding a tool that writes means
 * changing this function, which is deliberately the same edit as revisiting the auth in front of it.
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
 * Builds a FinishLine MCP server for one authenticated caller. Called once per request, so nothing
 * here is shared between callers.
 * @param context the authenticated user and their organization
 */
export const buildMcpServer = (context: AgentContext): McpServer => {
  const server = new McpServer({ name: 'finishline', version: '1.0.0' });
  const { organization } = context;

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
        'and has no dates. Use finishline_get_work_packages for the schedule detail behind these dates.',
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
        'not COMPLETE is late. blockedBy lists the WBS numbers that must finish first.',
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
        'Page through them all before answering a question that counts or totals tasks.',
      inputSchema: z.object({ wbsNum: wbsNumSchema, offset: offsetSchema('tasks') })
    },
    async ({ wbsNum, offset }) =>
      withToolErrors(LIST_PROJECTS_HINT, async () => McpService.getTasks(wbsNum, organization, offset))
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

  return server;
};
