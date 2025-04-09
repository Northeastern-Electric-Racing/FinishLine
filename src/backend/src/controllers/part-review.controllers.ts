import { NextFunction, Request, Response } from 'express';
import PartReviewService from '../services/part-review.services';
import { WbsNumber, validateWBS } from 'shared';

export default class PartReviewController {
  static async getPart(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.organization.organizationId;
      const { partId } = req.params;
      const part = await PartReviewService.getPart(organizationId, partId);
      res.status(200).json(part);
    } catch (error: unknown) {
      next(error);
    }
  }

  // static async getPartPreviews(req: Request, res: Response, next: NextFunction) {
  //   try {
  //     const organization = req.organization;
  //     const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);

  //     const partPreviews = await PartReviewService.getPartPreviews(organization, wbsNumber);
  //     res.status(200).json(partPreviews);
  //   } catch (error: unknown) {
  //     next(error);
  //   }
  // }

  static async getAllPartTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tags = await PartReviewService.getAllPartTags(req.organization.organizationId);
      res.status(200).json(tags);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllPartReviewFAQS(req: Request, res: Response, next: NextFunction) {
    try {
      const partReviewFAQS = await PartReviewService.getAllPartReviewFAQs(req.organization.organizationId);
      res.status(200).json(partReviewFAQS);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;
      const faq = await PartReviewService.createFaq(question, answer, req.currentUser, req.organization.organizationId);
      res.status(200).json(faq);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { faqId } = req.params;
      const { question, answer } = req.body;
      const updatedfaq = await PartReviewService.updateFaq(
        faqId,
        question,
        answer,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).json(updatedfaq);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteFaq(req: Request, res: Response, next: NextFunction) {
    try {
      const { faqId } = req.params;
      const deletedfaq = await PartReviewService.deleteFaq(faqId, req.currentUser, req.organization.organizationId);
      res.status(200).json(deletedfaq);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createCommonMistake(req: Request, res: Response, next: NextFunction) {
    try {
      const { title, description, starred } = req.body;
      const commonMistake = await PartReviewService.createCommonMistake(
        title,
        description,
        starred,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).json(commonMistake);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateCommonMistake(req: Request, res: Response, next: NextFunction) {
    try {
      const { commonMistakeId } = req.params;
      const { title, description, starred } = req.body;
      const commonMistake = await PartReviewService.updateCommonMistake(
        commonMistakeId,
        title,
        description,
        starred,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).json(commonMistake);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteCommonMistake(req: Request, res: Response, next: NextFunction) {
    try {
      const { commonMistakeId } = req.params;
      const commonMistake = await PartReviewService.deleteCommonMistake(
        commonMistakeId,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).json(commonMistake);
    } catch (error: unknown) {
      next(error);
    }
  }
}
