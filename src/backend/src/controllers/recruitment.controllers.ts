import { NextFunction, Request, Response } from 'express';
import RecruitmentServices from '../services/recruitment.services';

export default class RecruitmentController {
  static async getAllMilestones(req: Request, res: Response, next: NextFunction) {
    try {
      const allMilestones = await RecruitmentServices.getAllMilestones(req.organization);
      res.status(200).json(allMilestones);
    } catch (error: unknown) {
      next(error);
    }
  }

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

  static async deleteMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { milestoneId } = req.params;
      await RecruitmentServices.deleteMilestone(req.currentUser, milestoneId, req.organization);
      res.status(200).json({ message: `Successfully deleted milestone with id ${milestoneId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllFaqs(req: Request, res: Response, next: NextFunction) {
    try {
      const allFaqs = await RecruitmentServices.getAllFaqs(req.organization);
      res.status(200).json(allFaqs);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;
      const faq = await RecruitmentServices.createFaq(req.currentUser, question, answer, req.organization);
      res.status(200).json(faq);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;
      const { faqId } = req.params;
      const editedFAQ = await RecruitmentServices.editFAQ(question, answer, req.currentUser, req.organization, faqId);
      res.status(200).json(editedFAQ);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { faqId } = req.params;
      await RecruitmentServices.deleteFaq(req.currentUser, faqId, req.organization);
      res.status(200).json({ message: `Successfully deleted FAQ with id ${faqId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getApplicationLink(req: Request, res: Response, next: NextFunction) {
    try {
      const applicationLink = await RecruitmentServices.getApplicationLink(req.organization);
      res.status(200).json(applicationLink);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
