import { Team } from 'shared';
import { NotFoundException } from '../exceptions/NotFoundException';
import prisma from '../prisma/prisma';
import { teamTransformer } from '../transformers/teams.transformer';
import { teamRelationArgs } from '../prisma.relation-args/team.args';

export class TeamsService {
  static async getAllTeams(): Promise<Team[]> {
    const teams = await prisma.team.findMany(teamRelationArgs);
    return teams.map(teamTransformer);
  }

  static async getSingleTeam(teamId: string): Promise<Team> {
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamRelationArgs
    });

    if (!team) {
      throw new NotFoundException(`Team with id ${teamId} not found!`);
    }

    return teamTransformer(team);
  }
}
