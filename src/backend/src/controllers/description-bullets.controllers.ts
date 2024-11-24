import { NextFunction, Request, Response } from 'express';
import DescriptionBulletsService from '../services/description-bullets.services';

export default class DescriptionBulletsController {
  static async checkDescriptionBullet(req: Request, res: Response, next: NextFunction) {
    try {
      const { descriptionId } = req.body;
      const updatedDB = await DescriptionBulletsService.checkDescriptionBullet(
        req.currentUser,
        descriptionId,
        req.organization
      );
      return res.status(200).json(updatedDB);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllDescriptionBulletTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const descriptionBulletTypes = await DescriptionBulletsService.getAllDescriptionBulletTypes(req.organization);
      return res.status(200).json(descriptionBulletTypes);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createDescriptionBulletType(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, workPackageRequired, projectRequired } = req.body;
      const newDescriptionBulletType = await DescriptionBulletsService.createDescriptionBulletType(
        req.currentUser,
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

      const updatedDescriptionBulletType = await DescriptionBulletsService.editDescriptionBulletType(
        req.currentUser,
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
