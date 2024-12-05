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

  static async getGeneralChecklists(req: Request, res: Response, next: NextFunction) {
    try {
      const generalChecklists = await OnboardingServices.getGeneralChecklists(req.organization);
      res.status(200).json(generalChecklists);
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

  static async getTeamTypeChecklists(req: Request, res: Response, next: NextFunction) {
    try {
      const { teamTypeIds } = req.body;
      const checklists = OnboardingServices.getTeamTypeChecklists(teamTypeIds, req.organization);
      res.status(200).json(checklists);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, descriptions, isOptional, teamId, teamTypeId, parentChecklistId } = req.body;
      const checklist = await OnboardingServices.createChecklist(
        req.currentUser,
        name,
        descriptions,
        isOptional,
        teamId,
        teamTypeId,
        parentChecklistId,
        req.organization
      );
      res.status(200).json(checklist);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistId } = req.params;
      const { name, descriptions, isOptional, teamId, teamTypeId, parentChecklistId } = req.body;
      const checklist = await OnboardingServices.editChecklist(
        req.currentUser,
        checklistId,
        name,
        descriptions,
        isOptional,
        teamId,
        teamTypeId,
        parentChecklistId,
        req.organization
      );
      res.status(200).json(checklist);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistId } = req.params;
      await OnboardingServices.deleteChecklist(req.currentUser, checklistId, req.organization);
      res.status(200).json({ message: 'Checklist deleted successfully' });
    } catch (error: unknown) {
      return next(error);
    }
  }
}
