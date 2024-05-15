import { NextFunction, Request, Response } from 'express';
import { validateWBS, WbsNumber, WorkPackage, WorkPackageTemplate } from 'shared';
import WorkPackagesService from '../services/work-packages.services';
import { getCurrentUser } from '../utils/auth.utils';

/** Controller for operations involving work packages. */
export default class WorkPackagesController {
  // Fetch all work packages, optionally filtered by query parameters
  static async getAllWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const { organizationId } = req.headers as { organizationId: string };

      const outputWorkPackages: WorkPackage[] = await WorkPackagesService.getAllWorkPackages(query, organizationId);

      res.status(200).json(outputWorkPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Fetch the work package for the specified WBS number
  static async getSingleWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedWbs: WbsNumber = validateWBS(req.params.wbsNum);
      const { organizationId } = req.headers as { organizationId: string };

      const wp: WorkPackage = await WorkPackagesService.getSingleWorkPackage(parsedWbs, organizationId);

      res.status(200).json(wp);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getManyWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNums } = req.body;
      const { organizationId } = req.headers as { organizationId: string };

      const workPackages: WorkPackage[] = await WorkPackagesService.getManyWorkPackages(wbsNums, organizationId);
      res.status(200).json(workPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Create a work package with the given details
  static async createWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, crId, startDate, duration, blockedBy, descriptionBullets } = req.body;
      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }
      const user = await getCurrentUser(res);
      const { organizationId } = req.headers as { organizationId: string };

      const workPackage = await WorkPackagesService.createWorkPackage(
        user,
        name,
        crId,
        stage,
        startDate,
        duration,
        blockedBy,
        descriptionBullets,
        organizationId
      );

      res.status(200).json(workPackage);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Edit a work package to the given specifications
  static async editWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        workPackageId,
        name,
        crId,
        startDate,
        duration,
        blockedBy,
        descriptionBullets,
        projectLeadId,
        projectManagerId
      } = req.body;
      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }
      const user = await getCurrentUser(res);
      const { organizationId } = req.headers as { organizationId: string };

      await WorkPackagesService.editWorkPackage(
        user,
        workPackageId,
        name,
        crId,
        stage,
        startDate,
        duration,
        blockedBy,
        descriptionBullets,
        projectLeadId,
        projectManagerId,
        organizationId
      );
      return res.status(200).json({ message: 'Work package updated successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }

  // Delete a work package that corresponds to the given wbs number
  static async deleteWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const wbsNum = validateWBS(req.params.wbsNum);
      const { organizationId } = req.headers as { organizationId: string };

      await WorkPackagesService.deleteWorkPackage(user, wbsNum, organizationId);
      return res.status(200).json({ message: `Successfully deleted work package #${req.params.wbsNum}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  // Get all work packages that are blocked by the given work package
  static async getBlockingWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum = validateWBS(req.params.wbsNum);
      const { organizationId } = req.headers as { organizationId: string };

      const blockingWorkPackages: WorkPackage[] = await WorkPackagesService.getBlockingWorkPackages(wbsNum, organizationId);

      return res.status(200).json(blockingWorkPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Send reminder message to project lead of every work package that is due before/on given deadline
  static async slackMessageUpcomingDeadlines(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { deadline } = req.body;
      const { organizationId } = req.headers as { organizationId: string };

      await WorkPackagesService.slackMessageUpcomingDeadlines(user, new Date(deadline), organizationId);
    } catch (error: unknown) {
      next(error);
    }
  }
  // Get a single work package template that corresponds to the given work package template id
  static async getSingleWorkPackageTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { workPackageTemplateId } = req.params;
      const { organizationId } = req.headers as { organizationId: string };

      const workPackageTemplate: WorkPackageTemplate = await WorkPackagesService.getSingleWorkPackageTemplate(
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
      const { organizationId } = req.headers as { organizationId: string };

      const workPackageTemplates: WorkPackageTemplate[] = await WorkPackagesService.getAllWorkPackageTemplates(
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
      const { organizationId } = req.headers as { organizationId: string };

      const updatedWorkPackageTemplate = await WorkPackagesService.editWorkPackageTemplate(
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

      return res.status(200).json(updatedWorkPackageTemplate);
    } catch (error: unknown) {
      next(error);
    }
  }
}
