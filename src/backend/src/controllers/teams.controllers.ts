import { NextFunction, Request, Response } from 'express';
import TeamsService from '../services/teams.services';
import { getCurrentUser } from '../utils/auth.utils';

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

  static async editDescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { newDescription } = req.body;
      const user = await getCurrentUser(res);
      const team = await TeamsService.editDescription(user, req.params.teamId, newDescription);
      return res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setTeamHead(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const { teamId } = req.params;
      const submitter = await getCurrentUser(res);
      const team = await TeamsService.setTeamHead(submitter, teamId, userId);
      return res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamName, headId, slackId, description } = req.body;
      const submitter = await getCurrentUser(res);
      const team = await TeamsService.createTeam(submitter, teamName, headId, slackId, description);
      return res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setTeamLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const { teamId } = req.params;
      const submitter = await getCurrentUser(res);
      const team = await TeamsService.setTeamLeads(submitter, teamId, userIds);
      return res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const deleter = await getCurrentUser(res);
      await TeamsService.deleteTeam(deleter, teamId);
      return res.status(204).json({ message: `Successfully deleted team with id ${teamId}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async archiveTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const user = await getCurrentUser(res);
      const archivedTeam = await TeamsService.archiveTeam(user, teamId);
      return res.status(200).json(archivedTeam);
    } catch (error: unknown) {
      next(error);
    }
  }


  static async createTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, iconName } = req.body;
      const submitter = await getCurrentUser(res);
      const createdTeamType = await TeamsService.createTeamType(submitter, name, iconName);
      return res.status(200).json(createdTeamType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllTeamTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const teamTypes = await TeamsService.getAllTeamTypes();
      return res.status(200).json(teamTypes);
    } catch (error: unknown) {
      next(error);
    }
  }
}
