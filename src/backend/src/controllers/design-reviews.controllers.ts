import { NextFunction, Request, Response } from 'express';
import DesignReviewsService from '../services/design-reviews.services';
import { getCurrentUser } from '../utils/auth.utils';
import { User } from '@prisma/client';

export default class DesignReviewsController {
  static async getAllDesignReviews(_req: Request, res: Response, next: NextFunction) {
    try {
      const designReviews = await DesignReviewsService.getAllDesignReviews();
      return res.status(200).json(designReviews);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const drId: string = req.params.designReviewId;
      const user: User = await getCurrentUser(res);
      const deletedDesignReview = await DesignReviewsService.deleteDesignReview(user, drId);
      return res.status(200).json(deletedDesignReview);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const submitter: User = await getCurrentUser(res);
      const { dateScheduled, teamTypeId, requiredMemberIds, optionalMemberIds, wbsNum, meetingTimes } = req.body;

      const createdDesignReview = await DesignReviewsService.createDesignReview(
        submitter,
        dateScheduled,
        teamTypeId,
        requiredMemberIds,
        optionalMemberIds,
        wbsNum,
        meetingTimes
      );
      return res.status(200).json(createdDesignReview);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const drId: string = req.params.designReviewId;
      const user: User = await getCurrentUser(res);
      const designReview = await DesignReviewsService.getSingleDesignReview(user, drId);
      return res.status(200).json(designReview);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Edit a work package to the given specifications
  static async editDesignReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        dateScheduled,
        teamTypeId,
        requiredMembersIds,
        optionalMembersIds,
        isOnline,
        isInPerson,
        zoomLink,
        location,
        docTemplateLink,
        status,
        attendees,
        meetingTimes
      } = req.body;

      const { designReviewId } = req.params;

      // get the user from the submitter
      const user = await getCurrentUser(res);

      await DesignReviewsService.editDesignReview(
        user,
        designReviewId,
        dateScheduled,
        teamTypeId,
        requiredMembersIds,
        optionalMembersIds,
        isOnline,
        isInPerson,
        zoomLink,
        location,
        docTemplateLink,
        status,
        attendees,
        meetingTimes
      );
      return res.status(200).json({ message: 'Design Review updated successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }

  // Mark the current user as confirmed for the given design review
  static async markUserConfirmed(req: Request, res: Response, next: NextFunction) {
    try {
      const { availability } = req.body;
      const { designReviewId } = req.params;
      const user = await getCurrentUser(res);

      const updatedDesignReview = await DesignReviewsService.markUserConfirmed(designReviewId, availability, user);
      return res.status(200).json(updatedDesignReview);
    } catch (error: unknown) {
      next(error);
    }
  }
}
