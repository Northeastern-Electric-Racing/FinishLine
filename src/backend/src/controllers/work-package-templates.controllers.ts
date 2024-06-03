import { NextFunction, Request, Response } from 'express';
import { WorkPackageTemplate } from 'shared';
import { getCurrentUser } from '../utils/auth.utils';
import { getOrganizationId } from '../utils/utils';
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

      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const workPackageTemplate: WorkPackageTemplate = await WorkPackageTemplatesService.createWorkPackageTemplate(
        user,
        templateName,
        templateNotes,
        workPackageName,
        stage,
        duration,
        descriptionBullets,
        blockedBy,
        organizationId
      );

      res.status(200).json(workPackageTemplate);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Get a single work package template that corresponds to the given work package template id
  static async getSingleWorkPackageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { workPackageTemplateId } = req.params;
      const organizationId = getOrganizationId(req.headers);

      const workPackageTemplate: WorkPackageTemplate = await WorkPackageTemplatesService.getSingleWorkPackageTemplate(
        user,
        workPackageTemplateId,
        organizationId
      );

      res.status(200).json(workPackageTemplate);
    } catch (error: unknown) {
      next(error);
    }
  }
  // Get all work package templates
  static async getAllWorkPackageTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const workPackageTemplates: WorkPackageTemplate[] = await WorkPackageTemplatesService.getAllWorkPackageTemplates(
        submitter,
        organizationId
      );

      res.status(200).json(workPackageTemplates);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editWorkPackageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const { workpackageTemplateId } = req.params;
      const { templateName, templateNotes, duration, blockedBy, descriptionBullets, workPackageName } = req.body;
      const user = await getCurrentUser(res);
      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }
      const organizationId = getOrganizationId(req.headers);

      const updatedWorkPackageTemplate = await WorkPackageTemplatesService.editWorkPackageTemplate(
        user,
        workpackageTemplateId,
        templateName,
        templateNotes,
        duration,
        stage,
        blockedBy,
        descriptionBullets,
        workPackageName,
        organizationId
      );

      res.status(200).json(updatedWorkPackageTemplate);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Delete a work package template that corresponds to the given workPackageTemplateId
  static async deleteWorkPackageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { workPackageTemplateId } = req.params;
      const organizationId = getOrganizationId(req.headers);

      await WorkPackageTemplatesService.deleteWorkPackageTemplate(user, workPackageTemplateId, organizationId);
      res.status(200).json({ message: `Successfully deleted work package template #${req.params.workPackageTemplateId}` });
    } catch (error: unknown) {
      next(error);
    }
  }
}
