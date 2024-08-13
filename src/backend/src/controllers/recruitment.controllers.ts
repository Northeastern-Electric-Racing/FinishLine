import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import RecruitmentServices from '../services/recruitment.services';

export default class RecruitmentController {
  static async createMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, dateOfEvent } = req.body;
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const milestone = await RecruitmentServices.createMilestone(submitter, name, description, dateOfEvent, req.organization);
      return res.status(200).json(milestone);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async editMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { milestoneId } = req.params;
      const { name, description, dateOfEvent } = req.body;
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const milestone = await RecruitmentServices.editMilestone(
        submitter,
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
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const allMilestones = await RecruitmentServices.getAllMilestones(req.organization);
      return res.status(200).json(allMilestones);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const faq = await RecruitmentServices.createFaq(submitter, question, answer, req.organization);
      return res.status(200).json(faq);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
