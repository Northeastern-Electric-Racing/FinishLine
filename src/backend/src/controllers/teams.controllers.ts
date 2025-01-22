import { NextFunction, Request, Response } from 'express';
import TeamsService from '../services/teams.services';
import { HttpException } from '../utils/errors.utils';

export default class TeamsController {
  static async getAllTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await TeamsService.getAllTeams(req.organization);

      res.status(200).json(teams);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllArchivedTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const teams = await TeamsService.getAllArchivedTeams(req.organization);

      res.status(200).json(teams);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;

      const team = await TeamsService.getSingleTeam(teamId, req.organization);

      res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const { teamId } = req.params;
      // update the team with the input fields
      const updateTeam = await TeamsService.setTeamMembers(req.currentUser, teamId, userIds, req.organization);

      //  the updated team
      res.status(200).json(updateTeam);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editDescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { newDescription } = req.body;

      const team = await TeamsService.editDescription(req.currentUser, req.params.teamId, newDescription, req.organization);
      res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setTeamHead(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const { teamId } = req.params;

      const team = await TeamsService.setTeamHead(req.currentUser, teamId, userId, req.organization);
      res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
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
      res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setTeamLeads(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const { teamId } = req.params;

      const team = await TeamsService.setTeamLeads(req.currentUser, teamId, userIds, req.organization);
      res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;

      await TeamsService.deleteTeam(req.currentUser, teamId, req.organization);
      res.status(204).json({ message: `Successfully deleted team with id ${teamId}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async archiveTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;

      const archivedTeam = await TeamsService.archiveTeam(req.currentUser, teamId, req.organization);
      res.status(200).json(archivedTeam);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.body;
      const { teamId } = req.params;

      const updatedTeam = await TeamsService.setTeamType(req.currentUser, teamId, teamTypeId, req.organization);

      res.status(200).json(updatedTeam);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setOnboardingUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.params;

      const updatedTeamType = await TeamsService.setOnboardingUser(req.currentUser, teamTypeId, req.organization);

      res.status(200).json(updatedTeamType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async completeOnboarding(req: Request, res: Response, next: NextFunction) {
    try {
      await TeamsService.completeOnboarding(req.currentUser);

      res.status(200).json({ message: 'Successfully completed onboarding' });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.params;

      const teamType = await TeamsService.getSingleTeamType(teamTypeId, req.organization);

      res.status(200).json(teamType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllTeamTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const teamTypes = await TeamsService.getAllTeamTypes(req.organization);
      res.status(200).json(teamTypes);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, iconName, description } = req.body;

      const createdTeamType = await TeamsService.createTeamType(
        req.currentUser,
        name,
        iconName,
        description,
        req.organization
      );
      res.status(200).json(createdTeamType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, iconName, description } = req.body;

      const teamType = await TeamsService.editTeamType(
        req.currentUser,
        req.params.teamTypeId,
        name,
        iconName,
        description,
        req.organization
      );
      res.status(200).json(teamType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.params;
      const deleter = req.currentUser;
      await TeamsService.deleteTeamType(deleter, teamTypeId, req.organization);
      res.status(200).json({ message: `Successfully deleted team type ${req.params.teamTypeId}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setTeamTypeImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { file } = req;
      if (!file) throw new HttpException(400, 'Invalid or undefined image data');
      const teamType = await TeamsService.setTeamTypeImage(req.currentUser, req.params.teamTypeId, file, req.organization);
      res.status(200).json(teamType);
    } catch (error: unknown) {
      next(error);
    }
  }
}
