import { NextFunction, Request, Response } from 'express';
import RecruitmentServices from '../services/recruitment.services.js';

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
      res.status(200).json(milestone);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { milestoneId } = req.params as Record<string, string>;
      const { name, description, dateOfEvent } = req.body;

      const milestone = await RecruitmentServices.editMilestone(
        req.currentUser,
        name,
        description,
        dateOfEvent,
        milestoneId,
        req.organization
      );
      res.status(200).json(milestone);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const { milestoneId } = req.params as Record<string, string>;
      await RecruitmentServices.deleteMilestone(req.currentUser, milestoneId, req.organization);
      res.status(200).json({ message: `Successfully deleted milestone with id ${milestoneId}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllOrganizationFaqs(req: Request, res: Response, next: NextFunction) {
    try {
      const allFaqs = await RecruitmentServices.getAllOrganizationFaqs(req.organization);
      res.status(200).json(allFaqs);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createOrganizationFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;
      const faq = await RecruitmentServices.createOrganizationFaq(req.currentUser, question, answer, req.organization);
      res.status(200).json(faq);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editFAQ(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;
      const { faqId } = req.params as Record<string, string>;
      const editedFAQ = await RecruitmentServices.editFAQ(question, answer, req.currentUser, req.organization, faqId);
      res.status(200).json(editedFAQ);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { faqId } = req.params as Record<string, string>;
      await RecruitmentServices.deleteFaq(req.currentUser, faqId, req.organization);
      res.status(200).json({ message: `Successfully deleted FAQ with id ${faqId}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createGuestDefinition(req: Request, res: Response, next: NextFunction) {
    try {
      const { term, description, order, icon, buttonText, buttonLink } = req.body;
      const definition = await RecruitmentServices.createGuestDefinition(
        req.currentUser,
        req.organization,
        term,
        description,
        order,
        icon,
        buttonText,
        buttonLink
      );
      res.status(200).json(definition);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleGuestDefinition(req: Request, res: Response, next: NextFunction) {
    try {
      const { defenitionId } = req.params as Record<string, string>;

      const definition = await RecruitmentServices.getSingleGuestDefinition(req.organization, defenitionId);
      res.status(200).json(definition);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editGuestDefinition(req: Request, res: Response, next: NextFunction) {
    try {
      const { definitionId } = req.params as Record<string, string>;
      const { term, description, order, icon, buttonText, buttonLink } = req.body;

      const definition = await RecruitmentServices.editGuestDefinition(
        req.currentUser,
        req.organization,
        term,
        description,
        definitionId,
        order,
        icon,
        buttonText,
        buttonLink
      );
      res.status(200).json(definition);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteGuestDefinition(req: Request, res: Response, next: NextFunction) {
    try {
      const { definitionId } = req.params as Record<string, string>;
      await RecruitmentServices.deleteGuestDefinition(req.currentUser, definitionId, req.organization);
      res.status(200).json({ message: `Successfully deleted guestDefinition with id ${definitionId}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllGuestDefintions(req: Request, res: Response, next: NextFunction) {
    try {
      const allDefinitons = await RecruitmentServices.getAllGuestDefinitions(req.organization);
      res.status(200).json(allDefinitons);
    } catch (error: unknown) {
      next(error);
    }
  }
}
