import { NextFunction, Request, Response } from 'express';
import DesignReviewService from '../services/design-review.services';

export default class DesignReviewController {
  static async getSingleUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { designReviewId } = req.params;
      const requestedDesignReview = await DesignReviewService.getSingleUser(designReviewId);

      res.status(200).json(requestedDesignReview);
    } catch (error: unknown) {
      next(error);
    }
  }
}
