import { NextFunction, Request, Response } from 'express';
import { validateWBS, WbsNumber, WorkPackage, WorkPackagePreview, WorkPackageSelection } from 'shared';
import WorkPackagesService from '../services/work-packages.services.js';

/** Controller for operations involving work packages. */
export default class WorkPackagesController {
  // Fetch all work packages, optionally filtered by query parameters
  static async getAllWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, daysUntilDeadline } = req.query as { status?: string; daysUntilDeadline?: string };

      const outputWorkPackages: WorkPackage[] = await WorkPackagesService.getAllWorkPackages(
        { status, daysUntilDeadline },
        req.organization,
        req.currentCar?.carId
      );

      res.status(200).json(outputWorkPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Fetch all work packages in preview format (minimal data for dropdowns/lists)
  static async getAllWorkPackagesPreview(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query as { status?: string };

      const outputWorkPackages: WorkPackagePreview[] = await WorkPackagesService.getAllWorkPackagesPreview(
        status,
        req.organization,
        req.currentCar?.carId
      );

      res.status(200).json(outputWorkPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Fetch the work package for the specified WBS number
  static async getSingleWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedWbs: WbsNumber = validateWBS(req.params.wbsNum as string);

      const wp: WorkPackage = await WorkPackagesService.getSingleWorkPackage(parsedWbs, req.organization);

      res.status(200).json(wp);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getManyWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNums } = req.body;

      const workPackages: WorkPackage[] = await WorkPackagesService.getManyWorkPackages(wbsNums, req.organization);
      res.status(200).json(workPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // fetch all work packages for the given project wbs number
  static async getWorkPackagesByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectWbsNum: WbsNumber = validateWBS(req.params.wbsNum as string);
      const workPackages = await WorkPackagesService.getWorkPackagesByProject(projectWbsNum, req.organization);
      res.status(200).json(workPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Create a work package with the given details
  static async createWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, crId, startDate, duration, blockedBy, descriptionBullets, projectWbsNum } = req.body;
      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }
      const workPackage = await WorkPackagesService.createWorkPackage(
        req.currentUser,
        name,
        crId,
        stage,
        startDate,
        duration,
        blockedBy,
        descriptionBullets,
        projectWbsNum,
        req.organization
      );

      res.status(200).json(workPackage);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Edit a work package to the given specifications
  static async editWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { workPackageId, name, crId, startDate, duration, blockedBy, descriptionBullets, leadId, managerId } = req.body;
      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }
      await WorkPackagesService.editWorkPackage(
        req.currentUser,
        workPackageId,
        name,
        crId,
        stage,
        startDate,
        duration,
        blockedBy,
        descriptionBullets,
        leadId,
        managerId,
        req.organization
      );
      res.status(200).json({ message: 'Work package updated successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }

  // Delete a work package that corresponds to the given wbs number
  static async deleteWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum = validateWBS(req.params.wbsNum as string);

      await WorkPackagesService.deleteWorkPackage(req.currentUser, wbsNum, req.organization);
      res.status(200).json({ message: `Successfully deleted work package #${req.params.wbsNum as string}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  // Get all work packages that are blocked by the given work package
  static async getBlockingWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum = validateWBS(req.params.wbsNum as string);

      const blockingWorkPackages: WorkPackage[] = await WorkPackagesService.getBlockingWorkPackages(
        wbsNum,
        req.organization
      );

      res.status(200).json(blockingWorkPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Send reminder message to project lead of every work package that is due before/on given deadline
  static async slackMessageUpcomingDeadlines(req: Request, _res: Response, next: NextFunction) {
    try {
      const { deadline } = req.body;

      await WorkPackagesService.slackMessageUpcomingDeadlines(req.currentUser, new Date(deadline), req.organization);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getHomePageWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { selection } = req.params as Record<string, string>;

      const workPackages: WorkPackagePreview[] = await WorkPackagesService.getHomePageWorkPackages(
        req.currentUser,
        req.organization,
        selection as WorkPackageSelection,
        req.currentCar?.carId
      );

      res.status(200).json(workPackages);
    } catch (error: unknown) {
      next(error);
    }
  }
}
