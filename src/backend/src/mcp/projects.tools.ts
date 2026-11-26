import * as z from 'zod/v4';
import { validateWBS } from 'shared';
import ProjectsService from '../services/projects.services.js';
import { withToolErrors } from './errors.js';
import { LIST_PROJECTS_HINT, registerReadOnlyTool, ToolRegistrar, wbsNumSchema } from './tools.utils.js';

export const registerProjectTools: ToolRegistrar = (server, { user, organization, currentCar }) => {
  registerReadOnlyTool(
    server,
    'finishline_list_projects',
    {
      title: 'List projects',
      description:
        'List projects newest first, with their names, WBS numbers, summaries, status, dates, and teams. ' +
        'Start here when the user names a project in words rather than by number, then match the name to ' +
        'a WBS number and use the other tools. Only the projects on the car this connection is scoped to ' +
        'come back, or every car when it is not scoped to one.',
      inputSchema: z.object({})
    },
    async () => withToolErrors('', async () => ProjectsService.getAllProjects(organization, currentCar?.carId))
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
