import { NextFunction, Request, Response } from 'express';
import DBService from '../services/description-bullets.services';
import { getCurrentUser } from '../utils/utils';

export default class DescriptionBulletsController {
  static async checkDescriptionBullet(req: Request, res: Response, next: NextFunction) {
    try {
      const { descriptionId } = req.body;
      const user = await getCurrentUser(res);
      const updatedDB = await DBService.checkDescriptionBullet(user, descriptionId);
      res.status(200).json(updatedDB);
    } catch (error: unknown) {
      next(error);
    }
  }
}
