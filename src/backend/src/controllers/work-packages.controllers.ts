import { NextFunction, Request, Response } from 'express';
import {
  BaseWorkPackage,
  validateWBS,
  WbsElementStatus,
  WbsNumber,
  WorkPackageCard,
  WorkPackageDetail,
  WorkPackageSelection,
  wbsPipe
} from 'shared';
import WorkPackagesService from '../services/work-packages.services.js';
import { broadcastBayDashboardUpdate } from '../utils/bay-dashboard-events.utils.js';

/** Controller for operations involving work packages. */
export default class WorkPackagesController {
  // Fetch all work packages as the base model (enough for dropdowns and lists)
  static async getAllWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query as { status?: string };

      const outputWorkPackages: BaseWorkPackage[] = await WorkPackagesService.getAllWorkPackages(
        status,
        req.organization,
        req.currentCar?.carId
      );

      res.status(200).json(outputWorkPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Fetch a minimal list of work packages for dropdowns (id + name + wbsNum + projectName)
  static async getAllWorkPackagesDropdown(req: Request, res: Response, next: NextFunction) {
    try {
      const workPackages = await WorkPackagesService.getAllWorkPackagesDropdown(req.organization);
      res.status(200).json(workPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Fetch the work package for the specified WBS number
  static async getSingleWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const parsedWbs: WbsNumber = validateWBS(req.params.wbsNum as string);

      const wp: WorkPackageDetail = await WorkPackagesService.getSingleWorkPackage(parsedWbs, req.organization);

      res.status(200).json(wp);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getManyWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNums } = req.body;

      const workPackages: BaseWorkPackage[] = await WorkPackagesService.getManyWorkPackages(wbsNums, req.organization);
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
      broadcastBayDashboardUpdate(req.organization.slug);

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
      broadcastBayDashboardUpdate(req.organization.slug);

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
      broadcastBayDashboardUpdate(req.organization.slug);

      res.status(200).json({ message: `Successfully deleted work package #${wbsPipe(wbsNum)}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  // Get all work packages that are blocked by the given work package
  static async getBlockingWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum = validateWBS(req.params.wbsNum as string);

      const blockingWorkPackages: BaseWorkPackage[] = await WorkPackagesService.getBlockingWorkPackages(
        wbsNum,
        req.organization
      );

      res.status(200).json(blockingWorkPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Send reminder message to project lead of every work package that is due before/on given deadline
  static async slackMessageUpcomingDeadlines(req: Request, res: Response, next: NextFunction) {
    try {
      const { deadline } = req.body;

      const upcomingWorkPackages = await WorkPackagesService.getUpcomingDeadlineWorkPackages(
        req.currentUser,
        new Date(deadline),
        req.organization
      );
      // sending is rate limited to one message every 2 seconds, so reply once access is checked instead of holding the
      // request open (and risking a client timeout and a duplicate resend) until every message is out
      res.sendStatus(204);
      WorkPackagesService.sendUpcomingDeadlineNotifications(upcomingWorkPackages).catch((error: unknown) => {
        console.error('Failed to send upcoming deadline slack notifications', error);
      });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getHomePageWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { selection } = req.params as Record<string, string>;
      const { startsAfter, startsBefore, endsAfter, endsBefore, status } = req.query as Record<string, string | undefined>;
      const toDate = (value?: string) => (value ? new Date(value) : undefined);

      const workPackages: WorkPackageCard[] = await WorkPackagesService.getHomePageWorkPackages(
        req.currentUser,
        req.organization,
        selection as WorkPackageSelection,
        {
          startsAfter: toDate(startsAfter),
          startsBefore: toDate(startsBefore),
          endsAfter: toDate(endsAfter),
          endsBefore: toDate(endsBefore),
          status: status as WbsElementStatus | undefined
        },
        req.currentCar?.carId
      );

      res.status(200).json(workPackages);
    } catch (error: unknown) {
      next(error);
    }
  }
}
