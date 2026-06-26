import { Team } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { CarProcess } from './car.process.js';
import { UsersProcess, UsersOutput } from './user.process.js';
import { TeamOutput, TeamProcess } from './team.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { CarOutput } from '../context.js';
import {
  generateProjectBudgets,
  generateProjectTimeline,
  PROJECTS_PER_CAR,
  projectCreateInput,
  projectNameForIndex,
  projectTemplateCreateInput
} from '../factories/project.factory.js';

import type { ProjectContext } from '../context.js';

type ProjectInput = OrganizationOutput & CarOutput & UsersOutput & TeamOutput & ConfigDataOutput;

const PROJECT_TEMPLATES = [
  {
    templateName: 'Mechanical Project Template',
    projectName: 'Mechanical Assembly Project'
  },
  {
    templateName: 'Electrical Project Template',
    projectName: 'Electrical Integration Project'
  },
  {
    templateName: 'Software Project Template',
    projectName: 'Software Controls Project'
  }
];

const PROJECT_LINK_TYPE_NAMES = ['Confluence', 'Github', 'Altium', 'Google Drive'];

export type ProjectOutput = {
  projects: ProjectContext[];
  projectsByCarId: Record<string, ProjectContext[]>;
  projectsById: Record<string, ProjectContext>;
};

export class ProjectProcess extends SeedProcess<ProjectInput, ProjectOutput> {
  dependencies() {
    return [OrganizationProcess, CarProcess, UsersProcess, TeamProcess, ConfigDataProcess];
  }

  async run({
    organization,
    cars,
    teams,
    leadership,
    heads,
    admins,
    appAdmins,
    linkTypes
  }: ProjectInput): Promise<ProjectOutput> {
    const { organizationId } = organization;

    if (cars.length === 0) {
      throw new Error('ProjectProcess requires at least one car.');
    }

    if (teams.length === 0) {
      throw new Error('ProjectProcess requires at least one team.');
    }

    const projectOwners = [...leadership, ...heads, ...admins, ...appAdmins];

    if (projectOwners.length === 0) {
      throw new Error('ProjectProcess requires users who can be project leads and managers.');
    }

    const projectContextsByCar = await Promise.all(
      cars.map(async ({ car, dateRange }) => {
        const { carNumber } = car.wbsElement;
        const usedProjectNames = new Set<string>();
        const projectBudgets = generateProjectBudgets(this.faker, PROJECTS_PER_CAR);

        return Promise.all(
          Array.from({ length: PROJECTS_PER_CAR }, async (_, index) => {
            const projectNumber = index + 1;

            let projectName = projectNameForIndex(this.faker, index);

            while (usedProjectNames.has(projectName)) {
              projectName = projectNameForIndex(this.faker, index + usedProjectNames.size);
            }

            usedProjectNames.add(projectName);

            const assignedTeams = this.projectTeams(teams);
            const assignedTeamIds = assignedTeams.map((team) => team.teamId);

            const lead = this.faker.helpers.arrayElement(projectOwners);
            const managerPool = projectOwners.filter((user) => user.userId !== lead.userId);
            const manager = this.faker.helpers.arrayElement(managerPool.length > 0 ? managerPool : projectOwners);

            const selectedLinkTypes = this.projectLinkTypes(linkTypes);
            const timeline = generateProjectTimeline(this.faker, dateRange);

            const project = await this.prisma.project.create({
              data: projectCreateInput(
                organizationId,
                car.carId,
                carNumber,
                projectNumber,
                projectName,
                assignedTeamIds,
                lead.userId,
                manager.userId,
                selectedLinkTypes,
                lead.userId,
                { budget: projectBudgets[index] }
              ),
              include: {
                wbsElement: true,
                teams: true,
                car: true
              }
            });

            return { project, timeline };
          })
        );
      })
    );

    const projects = projectContextsByCar.flat();

    const templateCreatorId = appAdmins[0]?.userId;
    await this.createProjectTemplates(organizationId, templateCreatorId, teams);

    const projectsByCarId = projects.reduce<Record<string, ProjectContext[]>>((acc, projectContext) => {
      const { carId } = projectContext.project;

      acc[carId] ??= [];
      acc[carId].push(projectContext);

      return acc;
    }, {});

    const projectsById = projects.reduce<Record<string, ProjectContext>>((acc, projectContext) => {
      acc[projectContext.project.projectId] = projectContext;
      return acc;
    }, {});

    return {
      projects,
      projectsByCarId,
      projectsById
    };
  }

  private projectTeams(teams: Team[]) {
    const teamCount = this.faker.helpers.weightedArrayElement([
      { weight: 85, value: 1 },
      { weight: 12, value: 2 },
      { weight: 3, value: 3 }
    ]);

    return this.faker.helpers.arrayElements(teams, Math.min(teamCount, teams.length));
  }

  private projectLinkTypes(linkTypes: ProjectInput['linkTypes']) {
    const projectLinkTypes = linkTypes.filter((linkType) => PROJECT_LINK_TYPE_NAMES.includes(linkType.name));

    const linkCount = this.faker.helpers.weightedArrayElement([
      { weight: 45, value: 0 },
      { weight: 35, value: 1 },
      { weight: 15, value: 2 },
      { weight: 5, value: 3 }
    ]);

    return this.faker.helpers.arrayElements(projectLinkTypes, Math.min(linkCount, projectLinkTypes.length));
  }

  private async createProjectTemplates(organizationId: string, userCreatedId: string | undefined, teams: Team[]) {
    if (!userCreatedId) {
      throw new Error('ProjectProcess requires an app admin to create project templates.');
    }

    const templateTeamIds = teams.slice(0, 2).map((team) => team.teamId);

    await Promise.all(
      PROJECT_TEMPLATES.map(({ templateName, projectName }) =>
        this.prisma.wBS_Element_Template.create({
          data: projectTemplateCreateInput(organizationId, userCreatedId, templateName, projectName, templateTeamIds)
        })
      )
    );
  }
}
