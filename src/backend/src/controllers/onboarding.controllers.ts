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
      const checklists = await OnboardingServices.getUsersChecklists(req.currentUser.userId, req.organization);
      res.status(200).json(checklists);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { content, isOptional, teamId, teamTypeId, parentChecklistId, itemType } = req.body;
      const checklist = await OnboardingServices.createChecklist(
        req.currentUser,
        content,
        teamId,
        teamTypeId,
        parentChecklistId,
        req.organization,
        isOptional,
        itemType
      );
      res.status(200).json(checklist);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistId } = req.params;
      const { content, isOptional, teamId, teamTypeId, parentChecklistId, itemType } = req.body;
      const checklist = await OnboardingServices.editChecklist(
        req.currentUser,
        checklistId,
        content,
        teamId,
        teamTypeId,
        parentChecklistId,
        req.organization,
        isOptional,
        itemType
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

  static async toggleChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const { checklistId } = req.params;

      const updatedItem = await OnboardingServices.toggleChecklist(checklistId, req.currentUser, req.organization);
      res.status(200).json(updatedItem);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async downloadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;

      const imageData = await OnboardingServices.downloadImage(fileId);

      // Set the appropriate headers for the HTTP response
      res.setHeader('content-type', String(imageData.type));
      res.setHeader('content-length', imageData.buffer.length);

      // Send the Buffer as the response body
      res.send(imageData.buffer);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async reorderTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskIds } = req.body;
      await OnboardingServices.reorderTasks(req.currentUser, taskIds, req.organization);
      res.status(200).json({ message: 'Tasks reordered successfully' });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async reorderChecklistItems(req: Request, res: Response, next: NextFunction) {
    try {
      const { parentId } = req.params;
      const { itemIds } = req.body;
      await OnboardingServices.reorderChecklistItems(req.currentUser, parentId, itemIds, req.organization);
      res.status(200).json({ message: 'Checklist items reordered successfully' });
    } catch (error: unknown) {
      return next(error);
    }
  }
}
