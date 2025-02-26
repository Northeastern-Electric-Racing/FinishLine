import { NextFunction, Request, Response } from 'express';
import PartReviewService from '../services/part-review.services';

export default class PartReviewController {
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
      const { partTagId, name, colorHexCode } = req.body;
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
      const { partTagId } = req.body;
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
}
