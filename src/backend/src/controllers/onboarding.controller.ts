import { NextFunction, Request, Response } from 'express';
import OnboardingServices from '../services/onboarding.services';

export default class OnboardingController {
  /* Checklists section */
  static async getAllChecklists(req: Request, res: Response, next: NextFunction) {
    try {
      const checklists = await OnboardingServices.getAllChecklists(req.organization);
      res.status(200).json(checklists);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getCheckedChecklists(req: Request, res: Response, next: NextFunction) {
    try {
      const checkedChecklists = await OnboardingServices.getCheckedChecklists(req.currentUser, req.organization);
      res.status(200).json(checkedChecklists);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getUsersChecklists(req: Request, res: Response, next: NextFunction) {
    try {
      const checklists = await OnboardingServices.getUsersChecklists(req.currentUser);
      res.status(200).json(checklists);
    } catch (error: unknown) {
      next(error);
    }
  }

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

  /* ChecklistItem section */
  static async createChecklistItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, checklistId, description, parentChecklistItemId } = req.body;

      const checklist = await OnboardingServices.createChecklistItem(
        req.currentUser,
        name,
        checklistId,
        description,
        parentChecklistItemId,
        req.organization
      );
      res.status(200).json(checklist);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteChecklistItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistItemId } = req.params;
      await OnboardingServices.deleteChecklistItem(req.currentUser, checklistItemId, req.organization);
      res.status(200).json({ message: `Successfully deleted checklist item with id ${checklistItemId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async toggleChecklistItem(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistId } = req.params;
      const { userId } = req.currentUser;

      const updatedItem = await OnboardingServices.toggleChecklistItem(checklistId, userId);
      res.status(200).json(updatedItem);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
