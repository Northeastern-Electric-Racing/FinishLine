import { NextFunction, Request, Response } from 'express';
import DescriptionBulletsService from '../services/description-bullets.services';
import { getCurrentUser } from '../utils/auth.utils';
import { getOrganizationId } from '../utils/utils';

export default class DescriptionBulletsController {
  static async checkDescriptionBullet(req: Request, res: Response, next: NextFunction) {
    try {
      const { descriptionId } = req.body;
      const user = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const updatedDB = await DescriptionBulletsService.checkDescriptionBullet(user, descriptionId, organizationId);
      res.status(200).json(updatedDB);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllDescriptionBulletTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);

      const descriptionBulletTypes = await DescriptionBulletsService.getAllDescriptionBulletTypes(organizationId);
      res.status(200).json(descriptionBulletTypes);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createDescriptionBulletType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, workPackageRequired, projectRequired } = req.body;
      const organizationId = getOrganizationId(req.headers);
      const user = await getCurrentUser(res);

      const newDescriptionBulletType = await DescriptionBulletsService.createDescriptionBulletType(
        user,
        name,
        workPackageRequired,
        projectRequired,
        organizationId
      );
      res.status(201).json(newDescriptionBulletType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editDescriptionBulletType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, workPackageRequired, projectRequired } = req.body;
      const organizationId = getOrganizationId(req.headers);
      const user = await getCurrentUser(res);

      const updatedDescriptionBulletType = await DescriptionBulletsService.editDescriptionBulletType(
        user,
        name,
        workPackageRequired,
        projectRequired,
        organizationId
      );
      res.status(200).json(updatedDescriptionBulletType);
    } catch (error: unknown) {
      next(error);
    }
  }
}
