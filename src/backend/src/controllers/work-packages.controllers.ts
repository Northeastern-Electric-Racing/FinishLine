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
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const outputWorkPackages: WorkPackage[] = await WorkPackagesService.getAllWorkPackages(query, req.organization);

      return res.status(200).json(outputWorkPackages);
    } catch (error: unknown) {
      return next(error);
    }
  }

  // Fetch the work package for the specified WBS number
  static async getSingleWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedWbs: WbsNumber = validateWBS(req.params.wbsNum);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const wp: WorkPackage = await WorkPackagesService.getSingleWorkPackage(parsedWbs, req.organization);

      return res.status(200).json(wp);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getManyWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNums } = req.body;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const workPackages: WorkPackage[] = await WorkPackagesService.getManyWorkPackages(wbsNums, req.organization);
      return res.status(200).json(workPackages);
    } catch (error: unknown) {
      return next(error);
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
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const workPackage = await WorkPackagesService.createWorkPackage(
        user,
        name,
        crId,
        stage,
        startDate,
        duration,
        blockedBy,
        descriptionBullets,
        req.organization
      );

      return res.status(200).json(workPackage);
    } catch (error: unknown) {
      return next(error);
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
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

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
        leadId,
        managerId,
        req.organization
      );
      return res.status(200).json({ message: 'Work package updated successfully' });
    } catch (error: unknown) {
      return next(error);
    }
  }

  // Delete a work package that corresponds to the given wbs number
  static async deleteWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const wbsNum = validateWBS(req.params.wbsNum);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      await WorkPackagesService.deleteWorkPackage(user, wbsNum, req.organization);
      return res.status(200).json({ message: `Successfully deleted work package #${req.params.wbsNum}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  // Get all work packages that are blocked by the given work package
  static async getBlockingWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum = validateWBS(req.params.wbsNum);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const blockingWorkPackages: WorkPackage[] = await WorkPackagesService.getBlockingWorkPackages(wbsNum, req.organization);

      return res.status(200).json(blockingWorkPackages);
    } catch (error: unknown) {
      return next(error);
    }
  }

  // Send reminder message to project lead of every work package that is due before/on given deadline
  static async slackMessageUpcomingDeadlines(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { deadline } = req.body;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      await WorkPackagesService.slackMessageUpcomingDeadlines(user, new Date(deadline), req.organization);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
