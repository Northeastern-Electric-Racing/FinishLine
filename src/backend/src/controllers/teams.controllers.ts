import { NextFunction, Request, Response } from 'express';
import TeamsService from '../services/teams.services';
import { getCurrentUser } from '../utils/auth.utils';

export default class TeamsController {
  static async getAllTeams(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const teams = await TeamsService.getAllTeams(req.organization);

      return res.status(200).json(teams);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getSingleTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const team = await TeamsService.getSingleTeam(teamId, req.organization);

      return res.status(200).json(team);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      // update the team with the input fields
      const updateTeam = await TeamsService.setTeamMembers(submitter, req.params.teamId, userIds, req.organization);

      //  the updated team
      return res.status(200).json(updateTeam);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editDescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { newDescription } = req.body;
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const team = await TeamsService.editDescription(user, req.params.teamId, newDescription, req.organization);
      return res.status(200).json(team);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async setTeamHead(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const { teamId } = req.params;
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const team = await TeamsService.setTeamHead(submitter, teamId, userId, req.organization);
      return res.status(200).json(team);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamName, headId, slackId, description, isFinanceTeam } = req.body;
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const team = await TeamsService.createTeam(
        submitter,
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
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const team = await TeamsService.setTeamLeads(submitter, teamId, userIds, req.organization);
      return res.status(200).json(team);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const deleter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      await TeamsService.deleteTeam(deleter, teamId, req.organization);
      res.status(204).json({ message: `Successfully deleted team with id ${teamId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async archiveTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const archivedTeam = await TeamsService.archiveTeam(user, teamId, req.organization);
      return res.status(200).json(archivedTeam);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, iconName } = req.body;
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const createdTeamType = await TeamsService.createTeamType(submitter, name, iconName, req.organization);
      return res.status(200).json(createdTeamType);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getSingleTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.params;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const teamType = await TeamsService.getSingleTeamType(teamTypeId, req.organization);

      return res.status(200).json(teamType);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllTeamTypes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

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
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const updatedTeam = await TeamsService.setTeamType(submitter, teamId, teamTypeId, req.organization);

      return res.status(200).json(updatedTeam);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
