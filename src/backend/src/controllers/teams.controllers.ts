import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import { teamRelationArgs, teamTransformer } from '../utils/teams.utils';
import { Role } from '@prisma/client';
import { projectTransformer } from '../utils/projects.utils';
import { WbsElementStatus } from 'shared';

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

export const editDescription = async (req: Request, res: Response) => {
  const { body } = req;
  const { userId, teamId, newDescription } = body;

  const user = await prisma.user.findUnique({ where: { userId } });
  const team = await prisma.team.findUnique({
    where: { teamId },
    include: {
      leader: true,
      projects: {
        include: {
          wbsElement: true
        }
      },
      members: true
    }
  });
  if (!user) return res.status(404).json({ message: `User with id #${userId} not found!` });
  if (!team) return res.status(404).json({ message: `Team with id #${teamId} not found!` });

  const canAccess = (user.role === Role.ADMIN || user.role === Role.APP_ADMIN) && userId === team?.leaderId;
  if (!canAccess) return res.status(403).json({ message: 'Access Denied' });

  let updatedTeam = team;
  updatedTeam = await prisma.team.update({
    where: { teamId },
    include: {
      leader: true,
      projects: {
        include: {
          wbsElement: true
        }
      },
      members: true
    },
    data: {
      description: newDescription
    }
  });

  return res.status(200).json(teamTransformer(updatedTeam));
};
