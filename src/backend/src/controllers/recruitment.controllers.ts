import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import { getOrganizationId } from '../utils/utils';
import RecruitmentServices from '../services/recruitment.services';

export default class RecruitmentController {
  static async createMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, dateOfEvent } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const milestone = await RecruitmentServices.createMilestone(submitter, name, description, dateOfEvent, organizationId);
      res.status(200).json(milestone);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { milestoneId } = req.params;
      const { name, description, dateOfEvent } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const milestone = await RecruitmentServices.editMilestone(
        submitter,
        name,
        description,
        dateOfEvent,
        milestoneId,
        organizationId
      );
      res.status(200).json(milestone);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllMilestones(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);
      const allMilestones = await RecruitmentServices.getAllMilestones(organizationId);
      res.status(200).json(allMilestones);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { milestoneId } = req.params;
      const deleter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      await RecruitmentServices.deleteMilestone(deleter, milestoneId, organizationId);
      res.status(200).json({ message: `Successfully deleted milestone with id ${milestoneId}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;
      const submitter = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);

      const faq = await RecruitmentServices.createFaq(submitter, question, answer, organizationId);
      res.status(200).json(faq);
    } catch (error: unknown) {
      next(error);
    }
  }
}
