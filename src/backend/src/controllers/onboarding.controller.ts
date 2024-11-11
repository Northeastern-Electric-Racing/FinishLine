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

  static async deleteChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistId } = req.params;
      await OnboardingServices.deleteChecklist(req.currentUser, checklistId, req.organization);
      res.status(200).json({ message: `Successfully deleted checklist with id ${checklistId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }
}
