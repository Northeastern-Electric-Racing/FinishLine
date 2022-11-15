import { Prisma } from '@prisma/client';
import { Team } from 'shared';
import { teamRelationArgs } from '../services/prisma.relation.args/team.args';
import { userTransformer } from '../utils/users.utils';
import { wbsNumOf } from '../utils/utils';

export const teamTransformer = (team: Prisma.TeamGetPayload<typeof teamRelationArgs>): Team => {
  return {
    teamId: team.teamId,
    teamName: team.teamName,
    slackId: team.slackId,
    description: team.description,
    leader: userTransformer(team.leader),
    members: team.members.map(userTransformer),
    projects: team.projects.map((project) => ({
      id: project.projectId,
      wbsNum: wbsNumOf(project.wbsElement),
      name: project.wbsElement.name
    }))
  };
};
