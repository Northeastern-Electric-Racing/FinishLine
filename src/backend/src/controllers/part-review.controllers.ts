import { NextFunction, Request, Response } from 'express';
import PartReviewService from '../services/part-review.services';
import { validateWBS, WbsNumber } from 'shared';

export default class PartReviewController {
  static async getAllPartsForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const wbsNumber: WbsNumber = validateWBS(req.params.wbsNum);

      const parts = await PartReviewService.getAllPartsForProject(wbsNumber, req.organization);
      res.status(200).json(parts);
    } catch (error: unknown) {
      next(error);
    }
  }

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

  static async createPartTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, colorHexCode } = req.body;
      const partTag = await PartReviewService.createPartTag(
        name,
        colorHexCode,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).json(partTag);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updatePartTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { partTagId } = req.params;
      const { name, colorHexCode } = req.body;
      const updatedPartTag = await PartReviewService.updatePartTag(
        partTagId,
        name,
        colorHexCode,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).send(updatedPartTag);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deletePartTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { partTagId } = req.params;
      const deletedPartTag = await PartReviewService.deletePartTag(
        partTagId,
        req.currentUser,
        req.organization.organizationId
      );
      res.status(200).send(deletedPartTag);
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

  static async getAllCommonMistakes(req: Request, res: Response, next: NextFunction) {
    try {
      const commonMistakes = await PartReviewService.getAllCommonMistakes(req.organization.organizationId);
      res.status(200).json(commonMistakes);
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

  static async createPartReviewPopup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.currentUser;
      const { reviewId } = req.params;
      const organizationID = req.organization.organizationId;
      const { xCoord, yCoord, title, description } = req.body;
      const newPopup = await PartReviewService.createPartReviewPopup(
        organizationID,
        reviewId,
        xCoord,
        yCoord,
        title,
        description,
        user
      );
      res.status(200).json(newPopup);
    } catch (error) {
      next(error);
    }
  }

  static async updatePartReviewPopup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.currentUser;
      const { popupId } = req.params;
      const organizationID = req.organization.organizationId;
      const { xCoord, yCoord, title, description } = req.body;
      const updatedPopup = await PartReviewService.updatePartReviewPopup(
        organizationID,
        popupId,
        xCoord,
        yCoord,
        title,
        description,
        user
      );
      res.status(200).json(updatedPopup);
    } catch (error) {
      next(error);
    }
  }

  static async deletePartReviewPopup(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.currentUser;
      const { popupId } = req.params;
      const organizationID = req.organization.organizationId;
      const message = await PartReviewService.deletePartReviewPopup(popupId, user, organizationID);
      res.status(200).json(message);
    } catch (error) {
      next(error);
    }
  }
}
