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
      const { name, crId, startDate, duration, blockedBy, expectedActivities, deliverables } = req.body;

      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }

      const user = await getCurrentUser(res);

      const wbsString: string = await WorkPackagesService.createWorkPackage(
        user,
        name,
        crId,
        stage,
        startDate,
        duration,
        blockedBy,
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
        blockedBy,
        expectedActivities,
        deliverables,
        projectLeadId,
        projectManagerId
      } = req.body;

      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }

      const user = await getCurrentUser(res);

      await WorkPackagesService.editWorkPackage(
        user,
        workPackageId,
        name,
        crId,
        stage,
        startDate,
        duration,
        blockedBy,
        expectedActivities,
        deliverables,
        projectLeadId,
        projectManagerId
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

      await WorkPackagesService.deleteWorkPackage(user, wbsNum);
      return res.status(200).json({ message: `Successfully deleted work package #${req.params.wbsNum}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getBlockingWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum = validateWBS(req.params.wbsNum);
      const blockingWorkPackages: WorkPackage[] = await WorkPackagesService.getBlockingWorkPackages(wbsNum);

      return res.status(200).json(blockingWorkPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async slackMessageUpcomingDeadlines(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { deadline } = req.body;

      await WorkPackagesService.slackMessageUpcomingDeadlines(user, new Date(deadline));
    } catch (error: unknown) {
      next(error);
    }
  }
}
