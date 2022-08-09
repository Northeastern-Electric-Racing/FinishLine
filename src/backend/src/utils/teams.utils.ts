import { Prisma } from '@prisma/client';
import { Team } from 'shared';
import { wbsNumOf } from './utils';

export const teamRelationArgs = Prisma.validator<Prisma.TeamArgs>()({
  include: {
    members: true,
    leader: true,
    projects: {
      include: {
        wbsElement: true
      }
    }
  }
});

export const teamTransformer = (team: Prisma.TeamGetPayload<typeof teamRelationArgs>): Team => {
  if (team === null) throw new TypeError('Team not found');

  return {
    teamId: team.teamId,
    teamName: team.teamName,
    slackId: team.slackId,
    description: team.description,
    leader: team.leader,
    members: team.members,
    projects: team.projects.map((project) => ({
      id: project.projectId,
      wbsNum: wbsNumOf(project.wbsElement),
      name: project.wbsElement.name
    }))
  };
};
