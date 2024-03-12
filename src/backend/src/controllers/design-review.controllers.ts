import { User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { getCurrentUser } from '../utils/auth.utils';
import DesignReviewService from '../services/design-review.services';

export default class DesignReviewController {
  static async getAllDesignReviews(_req: Request, res: Response, next: NextFunction) {
    try {
      const designReviews = await DesignReviewService.getAllDesignReviews();
      return res.status(200).json(designReviews);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const drId: string = req.params.designReviewId;
      const user: User = await getCurrentUser(res);
      const deletedDesignReview = await DesignReviewService.deleteDesignReview(user, drId);
      return res.status(200).json(deletedDesignReview);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const drId: string = req.params.designReviewId;
      const user: User = await getCurrentUser(res);
      const designReview = await DesignReviewService.getSingleDesignReview(user, drId);
      return res.status(200).json(designReview);
    } catch (error: unknown) {
      next(error);
    }
  }
}
