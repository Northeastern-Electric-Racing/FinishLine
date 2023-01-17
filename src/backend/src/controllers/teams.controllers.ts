import { NextFunction, Request, Response } from 'express';
import TeamsService from '../services/teams.services';
import { getCurrentUser } from '../utils/utils';

export default class TeamsController {
  static async getAllTeams(_req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await TeamsService.getAllTeams();

      return res.status(200).json(teams);
    } catch (error: unknown) {
      next(error);
    }
  }
  
  static async editDescription(_req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, newDescription } = _req.body;
      const user = await getCurrentUser(res);
      const team = await TeamsService.editDescription(user, teamId, newDescription);
      return res.status(200).json(team);
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

  static async setTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const submitter = await getCurrentUser(res);

      // update the team with the input fields
      const updateTeam = await TeamsService.setTeamMembers(submitter, req.params.teamId, userIds);

      // return the updated team
      return res.status(200).json(updateTeam);
    } catch (error: unknown) {
      next(error);
    }
  }
}
