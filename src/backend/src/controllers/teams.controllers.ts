import { prisma, Role, User } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import TeamsService from '../services/teams.services';
import teamTransformer from '../transformers/teams.transformer';
import { getCurrentUser } from '../utils/utils';
import { getSingleUser } from './users.controllers';

export default class TeamsController {
  static async getAllTeams(_req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await TeamsService.getAllTeams();

      return res.status(200).json(teams);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;

      const team = await TeamsService.getSingleTeam(teamId);

      return res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editDescription(req: Request, res: Response) {
    const { userId, teamId, newDescription } = req.params;

    //const user = await prisma.user.findUnique({ where: { userId } });
    const team = await TeamsService.getSingleTeam(teamId);
    const user = await prisma.user.findUnique({ where: { userId } });
    if (!user) return res.status(404).json({ message: `User with id #${userId} not found!` });
    if (!team) return res.status(404).json({ message: `Team with id #${teamId} not found!` });

    const canAccess = user.role === Role.ADMIN || user.role === Role.APP_ADMIN || user === team.leader;
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
        members: true,
        leaderId: true
      },
      data: {
        description: newDescription
      }
    });

    return res.status(200).json(teamTransformer(updatedTeam));
  }
}
