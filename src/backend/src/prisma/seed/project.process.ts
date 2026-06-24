import { Team } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { CarProcess } from './car.process.js';
import { UsersProcess, UsersOutput } from './user.process.js';
import { TeamOutput, TeamProcess } from './team.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { CarOutput } from '../context.js';
import {
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

        return Promise.all(
          Array.from({ length: PROJECTS_PER_CAR }, async (_, index) => {
            const projectNumber = index + 1;

            let projectName = projectNameForIndex(this.faker, index);

            while (usedProjectNames.has(projectName)) {
              projectName = projectNameForIndex(this.faker, index + usedProjectNames.size);
            }

            usedProjectNames.add(projectName);

            const assignedTeams = this.faker.helpers.arrayElements(
              teams,
              this.faker.number.int({ min: 1, max: Math.min(3, teams.length) })
            );

            const assignedTeamIds = assignedTeams.map((team) => team.teamId);

            const lead = this.faker.helpers.arrayElement(projectOwners);
            const managerPool = projectOwners.filter((user) => user.userId !== lead.userId);
            const manager = this.faker.helpers.arrayElement(managerPool.length > 0 ? managerPool : projectOwners);

            const timeline = generateProjectTimeline(this.faker, dateRange);

            const project = await this.prisma.project.create({
              data: projectCreateInput(
                this.faker,
                organizationId,
                car.carId,
                carNumber,
                projectNumber,
                projectName,
                assignedTeamIds,
                lead.userId,
                manager.userId,
                linkTypes,
                lead.userId
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
