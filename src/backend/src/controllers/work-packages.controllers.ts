import { NextFunction, Request, Response } from 'express';
import { validateWBS, WbsNumber, WorkPackage } from 'shared';
import WorkPackagesService from '../services/work-packages.services';
import { getCurrentUser } from '../utils/auth.utils';
import { getOrganizationId } from '../utils/utils';

/** Controller for operations involving work packages. */
export default class WorkPackagesController {
  // Fetch all work packages, optionally filtered by query parameters
  static async getAllWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req;
      const organizationId = getOrganizationId(req.headers);

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
      const organizationId = getOrganizationId(req.headers);

      const wp: WorkPackage = await WorkPackagesService.getSingleWorkPackage(parsedWbs, organizationId);

      res.status(200).json(wp);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getManyWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNums } = req.body;
      const organizationId = getOrganizationId(req.headers);

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
      const organizationId = getOrganizationId(req.headers);

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
      const { workPackageId, name, crId, startDate, duration, blockedBy, descriptionBullets, leadId, managerId } = req.body;
      let { stage } = req.body;
      if (stage === 'NONE') {
        stage = null;
      }
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

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
        organizationId
      );
      res.status(200).json({ message: 'Work package updated successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }

  // Delete a work package that corresponds to the given wbs number
  static async deleteWorkPackage(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const wbsNum = validateWBS(req.params.wbsNum);
      const { crId } = req.body;
      const organizationId = getOrganizationId(req.headers);

      await WorkPackagesService.deleteWorkPackage(user, wbsNum, crId, organizationId);
      res.status(200).json({ message: `Successfully deleted work package #${req.params.wbsNum}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  // Get all work packages that are blocked by the given work package
  static async getBlockingWorkPackages(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNum = validateWBS(req.params.wbsNum);
      const organizationId = getOrganizationId(req.headers);

      const blockingWorkPackages: WorkPackage[] = await WorkPackagesService.getBlockingWorkPackages(wbsNum, organizationId);

      res.status(200).json(blockingWorkPackages);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Send reminder message to project lead of every work package that is due before/on given deadline
  static async slackMessageUpcomingDeadlines(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await getCurrentUser(res);
      const { deadline } = req.body;
      const organizationId = getOrganizationId(req.headers);

      await WorkPackagesService.slackMessageUpcomingDeadlines(user, new Date(deadline), organizationId);
    } catch (error: unknown) {
      next(error);
    }
  }
}
