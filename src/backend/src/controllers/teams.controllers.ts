import { NextFunction, Request, Response } from 'express';
import TeamsService from '../services/teams.services';

export default class TeamsController {
  static async getAllTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await TeamsService.getAllTeams(req.organization);

      return res.status(200).json(teams);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getSingleTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;

      const team = await TeamsService.getSingleTeam(teamId, req.organization);

      return res.status(200).json(team);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;

      // update the team with the input fields
      const updateTeam = await TeamsService.setTeamMembers(req.currentUser, req.params.teamId, userIds, req.organization);

      //  the updated team
      return res.status(200).json(updateTeam);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editDescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { newDescription } = req.body;

      const team = await TeamsService.editDescription(req.currentUser, req.params.teamId, newDescription, req.organization);
      return res.status(200).json(team);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setTeamHead(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const { teamId } = req.params;

      const team = await TeamsService.setTeamHead(req.currentUser, teamId, userId, req.organization);
      return res.status(200).json(team);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamName, headId, slackId, description, isFinanceTeam } = req.body;

      const team = await TeamsService.createTeam(
        req.currentUser,
        teamName,
        headId,
        slackId,
        description,
        isFinanceTeam,
        req.organization
      );
      return res.status(200).json(team);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setTeamLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const { teamId } = req.params;

      const team = await TeamsService.setTeamLeads(req.currentUser, teamId, userIds, req.organization);
      return res.status(200).json(team);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;

      await TeamsService.deleteTeam(req.currentUser, teamId, req.organization);
      res.status(204).json({ message: `Successfully deleted team with id ${teamId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async archiveTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;

      const archivedTeam = await TeamsService.archiveTeam(req.currentUser, teamId, req.organization);
      return res.status(200).json(archivedTeam);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, iconName } = req.body;

      const createdTeamType = await TeamsService.createTeamType(req.currentUser, name, iconName, req.organization);
      return res.status(200).json(createdTeamType);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getSingleTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.params;

      const teamType = await TeamsService.getSingleTeamType(teamTypeId, req.organization);

      return res.status(200).json(teamType);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllTeamTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const teamTypes = await TeamsService.getAllTeamTypes(req.organization);
      return res.status(200).json(teamTypes);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.body;
      const { teamId } = req.params;

      const updatedTeam = await TeamsService.setTeamType(req.currentUser, teamId, teamTypeId, req.organization);

      return res.status(200).json(updatedTeam);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
