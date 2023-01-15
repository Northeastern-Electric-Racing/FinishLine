import { NextFunction, Request, Response } from 'express';
import TeamsService from '../services/teams.services';

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
}

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
