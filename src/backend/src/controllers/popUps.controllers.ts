import { NextFunction, Request, Response } from 'express';
import { PopUpService } from '../services/pop-up.services';

export default class PopUpsController {
  static async getUserUnreadPopUps(req: Request, res: Response, next: NextFunction) {
    try {
      const { organization, currentUser } = req;

      const unreadPopUps = await PopUpService.getUserUnreadPopUps(currentUser.userId, organization.organizationId);
      res.status(200).json(unreadPopUps);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async removeUserPopUps(req: Request, res: Response, next: NextFunction) {
    try {
      const { popUpId } = req.params;
      const { organization, currentUser } = req;

      const unreadPopUps = await PopUpService.removeUserPopUp(currentUser.userId, popUpId, organization.organizationId);
      res.status(200).json(unreadPopUps);
    } catch (error: unknown) {
      next(error);
    }
  }
}
