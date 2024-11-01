import { NextFunction, Request, Response } from 'express';
import OnboardingServices from '../services/onboarding.services';

export default class OnboardingController {
  static async createChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, teamTypeId } = req.body;

      const checklist = await OnboardingServices.createChecklist(req.currentUser, name, teamTypeId, req.organization);
      return res.status(200).json(checklist);
    } catch (error: unknown) {
      return next(error);
    }
  }

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
