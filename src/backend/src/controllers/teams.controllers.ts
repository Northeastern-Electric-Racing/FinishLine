import { Request, Response } from 'express';
import TeamsService from '../services/teams.services';

export default class TeamController {
  static async getAllTeams(_req: Request, res: Response) {
    const teams = await TeamsService.getAllTeams();

    return res.status(200).json(teams);
  }

  static async getSingleTeam(req: Request, res: Response) {
    const { teamId } = req.params;

    const team = await TeamsService.getSingleTeam(teamId);

    return res.status(200).json(team);
  }
}
