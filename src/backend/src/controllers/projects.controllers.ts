import { Project, validateWBS, WbsNumber } from 'shared';
import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/utils';
import ProjectsService from '../services/projects.services';

export default class ProjectsController {
  static async getAllProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const outputProjects: Project[] = await ProjectsService.getAllProjects();
      res.status(200).json(outputProjects);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleProject(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedWbs: WbsNumber = validateWBS(req.params.wbsNum);
      const project: Project = await ProjectsService.getSingleProject(parsedWbs);
      res.status(200).json(project);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamId, carNumber, name, summary, crId, userId } = req.body;

      const user = await getCurrentUser(res);

      const wbsString: string = await ProjectsService.newProject(user, teamId, carNumber, name, summary, crId, userId);
      res.status(200).json(wbsString);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editProject(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        projectId,
        crId,
        userId,
        budget,
        summary,
        rules,
        goals,
        features,
        otherConstraints,
        name,
        googleDriveFolderLink,
        slideDeckLink,
        bomLink,
        taskListLink,
        projectLead,
        projectManager
      } = req.body;

      const user = await getCurrentUser(res);

      await ProjectsService.editProject(
        user,
        projectId,
        crId,
        userId,
        budget,
        summary,
        rules,
        goals,
        features,
        otherConstraints,
        name,
        googleDriveFolderLink,
        slideDeckLink,
        bomLink,
        taskListLink,
        projectLead,
        projectManager
      );

      return res.status(200).json({ message: 'Project updated successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async setProjectTeam(req: Request, res: Response, next: NextFunction) {
    try {
      // check for valid WBS number
      const { teamId } = req.body;
      const parsedWbs: WbsNumber = validateWBS(req.params.wbsNum);
      const user = await getCurrentUser(res);
      const updatedProject = await ProjectsService.setProjectTeam(parsedWbs, teamId, user);
      return res.status(200).json(updatedProject);
    } catch (error: unknown) {
      next(error);
    }
  }
}
