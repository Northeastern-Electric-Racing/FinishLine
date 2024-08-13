import { NextFunction, Request, Response } from 'express';
import DescriptionBulletsService from '../services/description-bullets.services';
import { getCurrentUser } from '../utils/auth.utils';

export default class DescriptionBulletsController {
  static async checkDescriptionBullet(req: Request, res: Response, next: NextFunction) {
    try {
      const { descriptionId } = req.body;
      const user = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const updatedDB = await DescriptionBulletsService.checkDescriptionBullet(user, descriptionId, req.organization);
      return res.status(200).json(updatedDB);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllDescriptionBulletTypes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const descriptionBulletTypes = await DescriptionBulletsService.getAllDescriptionBulletTypes(req.organization);
      return res.status(200).json(descriptionBulletTypes);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createDescriptionBulletType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, workPackageRequired, projectRequired } = req.body;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const user = await getCurrentUser(res);

      const newDescriptionBulletType = await DescriptionBulletsService.createDescriptionBulletType(
        user,
        name,
        workPackageRequired,
        projectRequired,
        req.organization
      );
      res.status(201).json(newDescriptionBulletType);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editDescriptionBulletType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, workPackageRequired, projectRequired } = req.body;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const user = await getCurrentUser(res);

      const updatedDescriptionBulletType = await DescriptionBulletsService.editDescriptionBulletType(
        user,
        name,
        workPackageRequired,
        projectRequired,
        req.organization
      );
      return res.status(200).json(updatedDescriptionBulletType);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
