import * as z from 'zod/v4';
import { validateWBS } from 'shared';
import ProjectsService from '../services/projects.services.js';
import CarsService from '../services/car.services.js';
import { withToolErrors } from './errors.js';
import { LIST_PROJECTS_HINT, registerReadOnlyTool, ToolRegistrar, wbsNumSchema } from './tools.utils.js';

export const registerProjectTools: ToolRegistrar = (server, { user, organization }) => {
  registerReadOnlyTool(
    server,
    'finishline_list_cars',
    {
      title: 'List cars',
      description:
        "List the organization's cars with their ids, names, and WBS numbers. The car number is the first " +
        'part of every WBS number, and the highest car number is the newest car, which is almost always ' +
        'the one the user means. Use a car id from here to filter finishline_list_projects.',
      inputSchema: z.object({})
    },
    async () => withToolErrors('', async () => CarsService.getAllCars(organization))
  );

  registerReadOnlyTool(
    server,
    'finishline_list_projects',
    {
      title: 'List projects',
      description:
        'List projects newest first, with their names, WBS numbers, summaries, status, dates, and teams. ' +
        'Start here when the user names a project in words rather than by number, then match the name to ' +
        'a WBS number and use the other tools. Pass carId to only list one car; without it, projects ' +
        'from every car come back, so prefer passing the newest car from finishline_list_cars.',
      inputSchema: z.object({
        carId: z
          .string()
          .optional()
          .describe('The id of the car to list projects for, from finishline_list_cars. Omit this for every car.')
      })
    },
    async ({ carId }) => withToolErrors('', async () => ProjectsService.getAllProjects(organization, carId))
  );

  registerReadOnlyTool(
    server,
    'finishline_get_project',
    {
      title: 'Get project',
      description:
        'Get everything about one project: its status, budget, lead and manager, teams, links, ' +
        'description bullets, change history, and all of its work packages. The dates and the status ' +
        "are derived from the project's work packages, so a project with no work packages is inactive " +
        'and has no dates.\n\n' +
        'Work packages are the scheduled phases of a project: each has a start date, a duration in ' +
        'weeks, an end date, a status (INACTIVE, ACTIVE, or COMPLETE), a stage, and description bullets ' +
        'whose type is typically "Deliverables" or "Expected Activities", though an organization can ' +
        "rename these. To judge whether a project is behind schedule, compare each work package's end " +
        "date and status against today's date: a work package whose end date has passed but whose " +
        'status is not COMPLETE is late. blockedBy lists the work packages that must finish first.',
      inputSchema: z.object({ wbsNum: wbsNumSchema })
    },
    async ({ wbsNum }) =>
      withToolErrors(LIST_PROJECTS_HINT, async () =>
        ProjectsService.getSingleProject(validateWBS(wbsNum), user, organization)
      )
  );
};
