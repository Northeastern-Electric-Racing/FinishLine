import { Prisma } from '@prisma/client';
import { Team, TeamPreview, TeamBase } from 'shared';
import { getTeamBaseQueryArgs, TeamPreviewQueryArgs, TeamQueryArgs } from '../prisma-query-args/teams.query-args.js';
import { userTransformer } from './user.transformer.js';
import { projectGanttTransformer } from './projects.transformer.js';
import { teamTypeTransformer } from './team-types.transformer.js';

const teamTransformer = (team: Prisma.TeamGetPayload<TeamQueryArgs>): Team => {
  return {
    teamId: team.teamId,
    teamName: team.teamName,
    slackId: team.slackId,
    description: team.description,
    head: userTransformer(team.head),
    members: team.members.map(userTransformer),
    projects: team.projects.map(projectGanttTransformer),
    leads: team.leads.map(userTransformer),
    userArchived: team.userArchived ? userTransformer(team.userArchived) : undefined,
    dateArchived: team.dateArchived ?? undefined,
    teamType: team.teamType ?? undefined
  };
};

export const teamBaseTransformer = (team: Prisma.TeamGetPayload<ReturnType<typeof getTeamBaseQueryArgs>>): TeamBase => {
  return {
    teamId: team.teamId,
    teamName: team.teamName,
    slackId: team.slackId,
    description: team.description,
    dateArchived: team.dateArchived ?? undefined,
    teamType: team.teamType ?? undefined
  };
};

export const teamPreviewTransformer = (team: Prisma.TeamGetPayload<TeamPreviewQueryArgs>): TeamPreview => {
  return {
    ...team,
    leads: team.leads.map(userTransformer),
    members: team.members.map(userTransformer),
    head: userTransformer(team.head),
    dateArchived: team.dateArchived ?? undefined,
    teamType: team.teamType ? teamTypeTransformer(team.teamType) : undefined
  };
};

export default teamTransformer;
