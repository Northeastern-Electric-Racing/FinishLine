import { NextFunction, Request, Response } from 'express';
import TeamsService from '../services/teams.services';
import { getCurrentUser } from '../utils/auth.utils';
import { getOrganizationId } from '../utils/utils';

export default class TeamsController {
  static async getAllTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);
      const teams = await TeamsService.getAllTeams(organizationId);

      res.status(200).json(teams);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const organizationId = getOrganizationId(req.headers);

      const team = await TeamsService.getSingleTeam(teamId, organizationId);

      res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      // update the team with the input fields
      const updateTeam = await TeamsService.setTeamMembers(submitter, req.params.teamId, userIds, organizationId);

      //  the updated team
      res.status(200).json(updateTeam);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editDescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { newDescription } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const team = await TeamsService.editDescription(user, req.params.teamId, newDescription, organizationId);
      res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setTeamHead(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body;
      const { teamId } = req.params;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const team = await TeamsService.setTeamHead(submitter, teamId, userId, organizationId);
      res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamName, headId, slackId, description, isFinanceTeam } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const team = await TeamsService.createTeam(
        submitter,
        teamName,
        headId,
        slackId,
        description,
        isFinanceTeam,
        organizationId
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
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const team = await TeamsService.setTeamLeads(submitter, teamId, userIds, organizationId);
      res.status(200).json(team);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const deleter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      await TeamsService.deleteTeam(deleter, teamId, organizationId);
      res.status(204).json({ message: `Successfully deleted team with id ${teamId}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async archiveTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId } = req.params;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const archivedTeam = await TeamsService.archiveTeam(user, teamId, organizationId);
      res.status(200).json(archivedTeam);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.body;
      const { teamId } = req.params;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const updatedTeam = await TeamsService.setTeamType(submitter, teamId, teamTypeId, organizationId);

      res.status(200).json(updatedTeam);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, iconName, description } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);
      const file = req.file ? req.file as Express.Multer.File : null;

      const createdTeamType = await TeamsService.createTeamType(submitter, name, iconName, description, file ? file.path : null, organizationId);
      res.status(200).json(createdTeamType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeId } = req.params;
      const organizationId = getOrganizationId(req.headers);

      const teamType = await TeamsService.getSingleTeamType(teamTypeId, organizationId);

      res.status(200).json(teamType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllTeamTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);

      const teamTypes = await TeamsService.getAllTeamTypes(organizationId);
      res.status(200).json(teamTypes);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editTeamType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, iconName, description } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);
      const file = req.file ? req.file as Express.Multer.File : null;

      const teamType = await TeamsService.editTeamType(
        user,
        req.params.teamTypeId,
        name,
        iconName,
        description,
        file ? file.path : null,
        organizationId
      );
      res.status(200).json(teamType);
    } catch (error: unknown) {
      next(error);
    }
  }
}
