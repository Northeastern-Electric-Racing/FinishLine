import { Prisma } from '@prisma/client';
import { McpCurrentUserTeam, McpProjectTeam, wbsPipe } from 'shared';
import { McpCurrentUserTeamQueryArgs, McpProjectTeamQueryArgs } from '../../prisma-query-args/mcp/teams.query-args.js';
import { wbsNumOf } from '../../utils/utils.js';
import { mcpUser } from './shared.js';

export const mcpProjectTeamTransformer = (team: Prisma.TeamGetPayload<McpProjectTeamQueryArgs>): McpProjectTeam => {
  return {
    teamName: team.teamName,
    head: mcpUser(team.head),
    leads: team.leads.map(mcpUser),
    members: team.members.map(mcpUser)
  };
};

/**
 * @param team a team the user is on, with only their own lead row selected
 * @param userId the user whose position on the team is reported
 */
export const mcpCurrentUserTeamTransformer = (
  team: Prisma.TeamGetPayload<McpCurrentUserTeamQueryArgs>,
  userId: string
): McpCurrentUserTeam => {
  // the team was found by the user being on it, so anyone not heading or leading it is a member
  const position = team.headId === userId ? 'HEAD' : team.leads.length > 0 ? 'LEAD' : 'MEMBER';

  return {
    teamName: team.teamName,
    position,
    projects: team.projects.map((project) => ({
      wbsNum: wbsPipe(wbsNumOf(project.wbsElement)),
      name: project.wbsElement.name
    }))
  };
};
