import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import { teamRelationArgs, teamTransformer } from '../utils/teams.utils';
import { Role } from '@prisma/client';

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
  const { userId, userIds } = body;
  let missingUserIds: number[] = [];

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

  const users = await Promise.all(
    userIds.map(async (userId: number) => await prisma.user.findUnique({ where: { userId } }))
  );

  // track any missing user from given userIds
  users.forEach((user, index) => {
    if (user === null) missingUserIds.push(userIds[index]);
  });

  if (missingUserIds.length > 0)
    return res.status(404).json({ message: `user with the following ids not found: ${missingUserIds.join(', ')}` });

  // retrieve userId for every given users to update team's members in the database
  const transofrmedUsers = users.map((user) => {
    return {
      userId: user.userId
    };
  });

  // update the team with the input fields
  const updateTeam = await prisma.team.update({
    where: {
      teamId: req.params.teamId
    },
    data: {
      members: {
        set: transofrmedUsers
      }
    }
  });
  // return the updaetd team
  return res.status(200).json(updateTeam);
};
