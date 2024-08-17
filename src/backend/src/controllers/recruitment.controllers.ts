import { NextFunction, Request, Response } from 'express';
import RecruitmentServices from '../services/recruitment.services';

export default class RecruitmentController {
  static async createMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, dateOfEvent } = req.body;

      const milestone = await RecruitmentServices.createMilestone(
        req.currentUser,
        name,
        description,
        dateOfEvent,
        req.organization
      );
      return res.status(200).json(milestone);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { milestoneId } = req.params;
      const { name, description, dateOfEvent } = req.body;

      const milestone = await RecruitmentServices.editMilestone(
        req.currentUser,
        name,
        description,
        dateOfEvent,
        milestoneId,
        req.organization
      );
      return res.status(200).json(milestone);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllMilestones(req: Request, res: Response, next: NextFunction) {
    try {
      const allMilestones = await RecruitmentServices.getAllMilestones(req.organization);
      return res.status(200).json(allMilestones);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;

      const faq = await RecruitmentServices.createFaq(req.currentUser, question, answer, req.organization);
      return res.status(200).json(faq);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
