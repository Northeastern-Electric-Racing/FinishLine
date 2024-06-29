import { Prisma } from '@prisma/client';
import { Team } from 'shared';
import { TeamQueryArgs } from '../prisma-query-args/teams.query-args';
import { calculateProjectStatus } from '../utils/projects.utils';
import { wbsNumOf } from '../utils/utils';
import { userTransformer } from './user.transformer';
import workPackageTransformer from './work-packages.transformer';

const teamTransformer = (team: Prisma.TeamGetPayload<TeamQueryArgs>): Team => {
  return {
    teamId: team.teamId,
    teamName: team.teamName,
    slackId: team.slackId,
    description: team.description,
    head: userTransformer(team.head),
    members: team.members.map(userTransformer),
    projects: team.projects.map((project) => ({
      id: project.projectId,
      wbsNum: wbsNumOf(project.wbsElement),
      name: project.wbsElement.name,
      status: calculateProjectStatus(project),
      workPackages: project.workPackages.map(workPackageTransformer),
      deleted: project.wbsElement.dateDeleted !== null
    })),
    leads: team.leads.map(userTransformer),
    userArchived: team.userArchived ? userTransformer(team.userArchived) : undefined,
    dateArchived: team.dateArchived ?? undefined,
    teamType: team.teamType ?? undefined
  };
};

export default teamTransformer;
