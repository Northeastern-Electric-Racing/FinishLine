import { Organization } from '@prisma/client';
import { McpServer } from '@modelcontextprotocol/server';
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
 * Builds a FinishLine MCP server for one authenticated caller. Called once per request, so nothing
 * here is shared between callers.
 * @param context the authenticated user and their organization
 */
export const buildMcpServer = (context: AgentContext): McpServer => {
  const server = new McpServer({ name: 'finishline', version: '1.0.0' });
  const { organization } = context;

  server.registerTool(
    'finishline_list_projects',
    {
      title: 'List projects',
      description:
        'List the projects on a car, with their names, WBS numbers, and one-line summaries. Start ' +
        'here when the user names a project in words rather than by number, then match the name to ' +
        'a WBS number and use the other tools. Cars are identified by a number and are consecutive. ' +
        'Omit carNumber to use the newest car, which is almost always what the user means; the response ' +
        'reports which car number was actually used.',
      inputSchema: z.object({
        carNumber: z
          .number()
          .int()
          .min(0)
          .optional()
          .describe('Which car to list projects for. Omit this to use the newest car.')
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ carNumber }) => withToolErrors('', async () => McpService.getProjects(organization, carNumber))
  );

  server.registerTool(
    'finishline_get_project',
    {
      title: 'Get project details',
      description:
        'Get the core details of one project: its status, budget, lead and manager, teams, links, ' +
        'start and end dates, and how many work packages it has. The dates and the status are ' +
        "derived from the project's work packages, so a project with no work packages is inactive " +
        'and has no dates. Use finishline_get_work_packages for the schedule detail behind these dates.',
      inputSchema: z.object({ wbsNum: z.string().describe(WBS_NUM_DESCRIPTION) }),
      annotations: { readOnlyHint: true }
    },
    async ({ wbsNum }) => withToolErrors(LIST_PROJECTS_HINT, async () => McpService.getProject(wbsNum, organization))
  );

  server.registerTool(
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
      inputSchema: z.object({ wbsNum: z.string().describe(WBS_NUM_DESCRIPTION) }),
      annotations: { readOnlyHint: true }
    },
    async ({ wbsNum }) => withToolErrors(LIST_PROJECTS_HINT, async () => McpService.getWorkPackages(wbsNum, organization))
  );

  server.registerTool(
    'finishline_get_tasks',
    {
      title: 'Get tasks',
      description:
        'List the tasks for a project. Tasks are smaller items of work than work packages, with a ' +
        'status (IN_BACKLOG, IN_PROGRESS, DONE), a priority, an optional deadline, and assignees. ' +
        'This includes tasks attached directly to the project and tasks attached to any of its work ' +
        'packages; parentWbsNum and parentName say which. Use this to answer questions about how a ' +
        'team is keeping up with its work.',
      inputSchema: z.object({ wbsNum: z.string().describe(WBS_NUM_DESCRIPTION) }),
      annotations: { readOnlyHint: true }
    },
    async ({ wbsNum }) => withToolErrors(LIST_PROJECTS_HINT, async () => McpService.getTasks(wbsNum, organization))
  );

  server.registerTool(
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
        startDate: z.string().describe('Start of the range, as an ISO date such as "2026-09-01".'),
        endDate: z
          .string()
          .describe('End of the range, as an ISO date. Must be on or after startDate and no more than 7 days later.')
      }),
      annotations: { readOnlyHint: true }
    },
    async ({ startDate, endDate }) =>
      withToolErrors('Split the request into one week at a time.', async () =>
        McpService.getEvents(new Date(startDate), new Date(endDate), organization)
      )
  );

  return server;
};
