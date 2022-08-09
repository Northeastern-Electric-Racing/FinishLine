import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import { teamRelationArgs, teamTransformer } from '../utils/teams.utils';

export const getAllTeams = async (_req: Request, res: Response) => {
  const teams = await prisma.team.findMany(teamRelationArgs);
  return res.status(200).json(teams.map(teamTransformer));
};

export const getSingleTeam = async (req: Request, res: Response) => {
  const team = await prisma.team.findUnique({
    where: { teamId: req.params.teamId },
    ...teamRelationArgs
  });

  if (!team) {
    return res.status(404).json({ message: `Team with id ${req.params.teamId} not found!` });
  }

  return res.status(200).json(teamTransformer(team));
};
