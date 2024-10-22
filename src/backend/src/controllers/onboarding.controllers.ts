import { NextFunction, Request, Response } from 'express';
import OnboardingServices from '../services/onboarding.services';

export default class OnboardingController {
  static async getUsersChecklists(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const checklists = await OnboardingServices.getUsersChecklists(userId);
      res.status(200).json(checklists);
    } catch (error: unknown) {
      next(error);
    }
  }
}
