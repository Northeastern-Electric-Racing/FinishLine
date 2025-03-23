import { NextFunction, Request, Response } from 'express';
import PartReviewService from '../services/part-review.services';
import { HttpException } from '../utils/errors.utils';

export default class PartReviewController {
  static async createPart(req: Request, res: Response, next: NextFunction) {
    try {
      const { index, commonName, description, reviewStatus, tagIds, assigneeIds } = req.body;
      const { projectId } = req.params;
      const part = await PartReviewService.createPart(
        req.organization.organizationId,
        projectId,
        req.currentUser,
        index,
        commonName,
        description,
        reviewStatus,
        tagIds,
        assigneeIds
      );
      res.status(200).json(part);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async uploadPreview(req: Request, res: Response, next: NextFunction) {
    try {
      const { file } = req;
      const { partId } = req.params;
      if (!file) throw new HttpException(400, 'Invalid or undefined image data');

      const newPreviewImage = await PartReviewService.uploadPreview(file, partId, req.currentUser, req.organization);

      res.status(200).json(newPreviewImage);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updatePart(req: Request, res: Response, next: NextFunction) {
    try {
      const { index, commonName, description, previewImageLink, reviewStatus, tagIds, assigneeIds } = req.body;
      const { partId } = req.params;
      const part = await PartReviewService.updatePart(
        req.organization.organizationId,
        partId,
        req.currentUser,
        index,
        commonName,
        description,
        reviewStatus,
        tagIds,
        assigneeIds
      );
      res.status(200).json(part);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deletePart(req: Request, res: Response, next: NextFunction) {
    try {
      const { partId } = req.params;
      const deletedPart = await PartReviewService.deletePart(partId, req.currentUser, req.organization.organizationId);
      res.status(200).json(deletedPart);
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
}
