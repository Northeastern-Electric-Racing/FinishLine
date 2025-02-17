import { NextFunction, Request, Response } from 'express';
import { ProjectTemplate, WorkPackageTemplate } from 'shared';
import WbsElementTemplatesService from '../services/wbs-element-templates.services';

/** Controller for operations involving work packages templates. */
export default class WbsElementTemplatesController {
  // Create a work package template with the given details
  static async createWorkPackageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateName, templateNotes, workPackageName, duration, descriptionBullets, blockedBy } = req.body;

      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }

      const workPackageTemplate: WorkPackageTemplate = await WbsElementTemplatesService.createWorkPackageTemplate(
        req.currentUser,
        templateName,
        templateNotes,
        workPackageName,
        stage,
        duration,
        descriptionBullets,
        blockedBy,
        req.organization
      );

      return res.status(200).json(workPackageTemplate);
    } catch (error: unknown) {
      return next(error);
    }
  }

  // Get a single work package template that corresponds to the given work package template id
  static async getSingleWorkPackageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { workPackageTemplateId } = req.params;

      const workPackageTemplate: WorkPackageTemplate = await WbsElementTemplatesService.getSingleWorkPackageTemplate(
        req.currentUser,
        workPackageTemplateId,
        req.organization
      );

      return res.status(200).json(workPackageTemplate);
    } catch (error: unknown) {
      return next(error);
    }
  }
  // Get all work package templates
  static async getAllWorkPackageTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const workPackageTemplates: WorkPackageTemplate[] = await WbsElementTemplatesService.getAllWorkPackageTemplates(
        req.currentUser,
        req.organization
      );

      return res.status(200).json(workPackageTemplates);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editWorkPackageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { workpackageTemplateId } = req.params;
      const { templateName, templateNotes, duration, blockedBy, descriptionBullets, workPackageName } = req.body;
      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }

      const updatedWorkPackageTemplate = await WbsElementTemplatesService.editWorkPackageTemplate(
        req.currentUser,
        workpackageTemplateId,
        templateName,
        templateNotes,
        duration,
        stage,
        blockedBy,
        descriptionBullets,
        workPackageName,
        req.organization
      );

      return res.status(200).json(updatedWorkPackageTemplate);
    } catch (error: unknown) {
      return next(error);
    }
  }

  // Delete a work package template that corresponds to the given workPackageTemplateId
  static async deleteWorkPackageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { workPackageTemplateId } = req.params;

      await WbsElementTemplatesService.deleteWorkPackageTemplate(req.currentUser, workPackageTemplateId, req.organization);
      return res
        .status(200)
        .json({ message: `Successfully deleted work package template #${req.params.workPackageTemplateId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllProjectTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const projectTemplates = await WbsElementTemplatesService.getAllProjectTemplates(req.currentUser, req.organization);
      return res.status(200).json(projectTemplates);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteProjectTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectTemplateId } = req.params;
      await WbsElementTemplatesService.deleteProjectTemplate(req.currentUser, projectTemplateId, req.organization);
      return res.status(200).json({ message: `Successfully deleted project template ${projectTemplateId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createProjectTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateName, templateNotes, descriptionBullets, workPackageTemplates, projectName, teams, budget, summary } =
        req.body;

      const projectTemplate: ProjectTemplate = await WbsElementTemplatesService.createProjectTemplate(
        req.currentUser,
        templateName,
        templateNotes,
        descriptionBullets,
        req.organization,
        workPackageTemplates,
        teams,
        budget,
        summary,
        projectName
      );

      return res.status(200).json(projectTemplate);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getSingleProjectTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectTemplateId } = req.params;

      const projectTemplate: ProjectTemplate = await WbsElementTemplatesService.getSingleProjectTemplate(
        req.currentUser,
        projectTemplateId,
        req.organization
      );

      return res.status(200).json(projectTemplate);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editProjectTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectTemplateId } = req.params;
      const { templateName, templateNotes, descriptionBullets, workPackageTemplates, projectName, budget, teams, summary } =
        req.body;

      const updatedProjectTemplate = await WbsElementTemplatesService.editProjectTemplate(
        req.currentUser,
        projectTemplateId,
        templateName,
        templateNotes,
        workPackageTemplates,
        descriptionBullets,
        req.organization,
        teams,
        projectName,
        budget,
        summary
      );

      return res.status(200).json(updatedProjectTemplate);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
