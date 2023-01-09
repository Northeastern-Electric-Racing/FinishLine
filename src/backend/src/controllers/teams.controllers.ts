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
