import { NextFunction, Request, Response } from 'express';
import PartReviewService from '../services/part-review.services';
import { getCurrentUser } from '../utils/auth.utils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class PartReviewController {
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

  static async createPartReviewPopup(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
          const user = await getCurrentUser(res);
          const { reviewId, xCoord, yCoord, title, description } = req.body;

          const review = await prisma.partReview.findUnique({
              where: { partReviewId: reviewId },
              select: { userCreatedId: true }
          });

          if (!review) {
              res.status(404).json({ error: 'Review not found' });
              return;
          }

          const isAdmin = user.additionalPermissions?.includes('ADMIN') || false;

          if (review.userCreatedId !== user.userId && !isAdmin) {
              res.status(403).json({ error: 'Unauthorized' });
              return;
          }

          const newPopup = await prisma.part_Review_Popup.create({
              data: { reviewId, xCoord, yCoord, title, description}
          });
          res.status(201).json(newPopup);
      } catch (error) {
          next(error);
      }
  };

  static async updatePartReviewPopup(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
          const user = await getCurrentUser(res);
          const { popupId } = req.params;
          const { xCoord, yCoord, title, description } = req.body;

          const popup = await prisma.part_Review_Popup.findUnique({
              where: { partReviewPopupId: popupId },
              include: { review: { select: { userCreatedId: true } } }
          });

          if (!popup) {
              res.status(404).json({ error: 'Popup not found' });
              return;
          }

          const isAdmin = user.additionalPermissions?.includes('ADMIN') || false;

          if (popup.review.userCreatedId !== user.userId && !isAdmin) {
              res.status(403).json({ error: 'Unauthorized' });
              return;
          }

          const updatedPopup = await prisma.part_Review_Popup.update({
              where: { partReviewPopupId: popupId },
              data: { xCoord, yCoord, title, description }
          });
          res.json(updatedPopup);
      } catch (error) {
          next(error);
      }
  };

  static async deletePartReviewPopup(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
          const user = await getCurrentUser(res);
          const { popupId } = req.params;

          const popup = await prisma.part_Review_Popup.findUnique({
              where: { partReviewPopupId: popupId },
              include: { review: { select: { userCreatedId: true } } }
          });

          if (!popup) {
              res.status(404).json({ error: 'Popup not found' });
              return;
          }

          const isAdmin = user.additionalPermissions?.includes('ADMIN') || false;

          if (popup.review.userCreatedId !== user.userId && !isAdmin) {
              res.status(403).json({ error: 'Unauthorized' });
              return;
          }

          await prisma.part_Review_Popup.delete({
              where: { partReviewPopupId: popupId }
          });
          res.json({ message: 'Popup deleted successfully' });
      } catch (error) {
          next(error);
      }
    }
}