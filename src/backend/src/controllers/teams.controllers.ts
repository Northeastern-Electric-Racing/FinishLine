import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import { teamRelationArgs, teamTransformer } from '../utils/teams.utils';
import { Role, User } from '@prisma/client';

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

export const setMembers = async (req: Request, res: Response) => {
  const { body } = req;
  const { userId, userIds } = body; // userId in body represents a submitter for team edit form

  // find and vertify the given teamId exist
  const team = await prisma.team.findUnique({
    where: { teamId: req.params.teamId },
    ...teamRelationArgs
  });

  if (!team) {
    return res.status(404).json({ message: `Team with id ${req.params.teamId} not found!` });
  }

  // verify the submitter is allowed to edit team
  const submitter = await prisma.user.findUnique({ where: { userId } });
  if (!submitter) return res.status(404).json({ message: `user with id ${userId} not found` });
  if (submitter.role !== Role.ADMIN && submitter.role !== Role.APP_ADMIN && submitter !== team.leader)
    return res.status(403).json({ message: 'Access Denied' });

  const users = userIds.map(async (userId: number) => await prisma.user.findUnique({ where: { userId } }));

  // users gets empty list of object for some reason
  const missingUserIds = users.filter((user: User) => user === null);

  if (missingUserIds.length > 0)
    return res.status(404).json({ message: `user with the following ids not found: ${missingUserIds.join(', ')}` });

  // update the team with the input fields
  const updateTeam = await prisma.team.update({
    where: {
      teamId: req.params.teamId
    },
    data: {
      members: users
    }
  });

  // return the updaetd team
  return res.status(200).json(updateTeam);
};
