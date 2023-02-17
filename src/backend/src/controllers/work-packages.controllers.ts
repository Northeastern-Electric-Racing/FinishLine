import { NextFunction, Request, Response } from 'express';
import { validateWBS, WbsNumber, WorkPackage } from 'shared';
import WorkPackagesService from '../services/work-packages.services';
import { getCurrentUser } from '../utils/auth.utils';

/** Controller for operations involving work packages. */
export default class WorkPackagesController {
  // Fetch all work packages, optionally filtered by query parameters
  static async getAllWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const outputWorkPackages: WorkPackage[] = await WorkPackagesService.getAllWorkPackages(query);

      res.status(200).json(outputWorkPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Fetch the work package for the specified WBS number
  static async getSingleWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedWbs: WbsNumber = validateWBS(req.params.wbsNum);
      const wp: WorkPackage = await WorkPackagesService.getSingleWorkPackage(parsedWbs);

      res.status(200).json(wp);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Create a work package with the given details
  static async createWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectWbsNum, name, crId, startDate, duration, dependencies, expectedActivities, deliverables, stage } = req.body;

      const user = await getCurrentUser(res);

      const wbsString: string = await WorkPackagesService.createWorkPackage(
        user,
        projectWbsNum,
        name,
        crId,
        stage,
        startDate,
        duration,
        dependencies,
        expectedActivities,
        deliverables
      );

      res.status(200).json(wbsString);
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
        dependencies,
        expectedActivities,
        deliverables,
        wbsElementStatus,
        projectLead,
        projectManager
      } = req.body;

      const user = await getCurrentUser(res);

      await WorkPackagesService.editWorkPackage(
        user,
        workPackageId,
        name,
        crId,
        startDate,
        duration,
        dependencies,
        expectedActivities,
        deliverables,
        wbsElementStatus,
        projectLead,
        projectManager
      );
      return res.status(200).json({ message: 'Work package updated successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }
}
