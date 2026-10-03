import { Prisma } from '@prisma/client';
import { McpProjectTeam } from 'shared';
import { McpProjectTeamQueryArgs } from '../../prisma-query-args/mcp/teams.query-args.js';
import { mcpUser } from './shared.js';

export const mcpProjectTeamTransformer = (team: Prisma.TeamGetPayload<McpProjectTeamQueryArgs>): McpProjectTeam => {
  return {
    teamName: team.teamName,
    head: mcpUser(team.head),
    leads: team.leads.map(mcpUser),
    members: team.members.map(mcpUser)
  };
};
