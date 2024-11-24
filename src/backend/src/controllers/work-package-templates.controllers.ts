import { NextFunction, Request, Response } from 'express';
import { WorkPackageTemplate } from 'shared';
import WorkPackageTemplatesService from '../services/work-package-template.services';

/** Controller for operations involving work packages templates. */
export default class WorkPackageTemplatesController {
  // Create a work package template with the given details
  static async createWorkPackageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { templateName, templateNotes, workPackageName, duration, descriptionBullets, blockedBy } = req.body;

      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }

      const workPackageTemplate: WorkPackageTemplate = await WorkPackageTemplatesService.createWorkPackageTemplate(
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

      const workPackageTemplate: WorkPackageTemplate = await WorkPackageTemplatesService.getSingleWorkPackageTemplate(
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
      const workPackageTemplates: WorkPackageTemplate[] = await WorkPackageTemplatesService.getAllWorkPackageTemplates(
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

      const updatedWorkPackageTemplate = await WorkPackageTemplatesService.editWorkPackageTemplate(
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

      await WorkPackageTemplatesService.deleteWorkPackageTemplate(req.currentUser, workPackageTemplateId, req.organization);
      return res
        .status(200)
        .json({ message: `Successfully deleted work package template #${req.params.workPackageTemplateId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }
}
