import { NextFunction, Request, Response } from 'express';
import DesignReviewsService from '../services/design-reviews.services';
import { getCurrentUserWithUserSettings } from '../utils/auth.utils';
import { User } from '@prisma/client';

export default class DesignReviewsController {
  static async getAllDesignReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const designReviews = await DesignReviewsService.getAllDesignReviews(req.organization);
      return res.status(200).json(designReviews);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const drId: string = req.params.designReviewId;
      const deletedDesignReview = await DesignReviewsService.deleteDesignReview(req.currentUser, drId, req.organization);
      return res.status(200).json(deletedDesignReview);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { dateScheduled, teamTypeId, requiredMemberIds, optionalMemberIds, wbsNum, meetingTimes } = req.body;

      const createdDesignReview = await DesignReviewsService.createDesignReview(
        req.currentUser,
        dateScheduled,
        teamTypeId,
        requiredMemberIds,
        optionalMemberIds,
        wbsNum,
        meetingTimes,
        req.organization
      );
      return res.status(200).json(createdDesignReview);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getSingleDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const drId: string = req.params.designReviewId;

      const designReview = await DesignReviewsService.getSingleDesignReview(req.currentUser, drId, req.organization);
      return res.status(200).json(designReview);
    } catch (error: unknown) {
      return next(error);
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

      await DesignReviewsService.editDesignReview(
        req.currentUser,
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
        meetingTimes,
        req.organization
      );
      return res.status(200).json({ message: 'Design Review updated successfully' });
    } catch (error: unknown) {
      return next(error);
    }
  }

  // Mark the current user as confirmed for the given design review
  static async markUserConfirmed(req: Request, res: Response, next: NextFunction) {
    try {
      const { availability } = req.body;
      const { designReviewId } = req.params;
      const user = await getCurrentUserWithUserSettings(res);

      const updatedDesignReview = await DesignReviewsService.markUserConfirmed(
        designReviewId,
        availability,
        user,
        req.organization
      );
      return res.status(200).json(updatedDesignReview);
    } catch (error: unknown) {
      return next(error);
    }
  }

  // Set a new status for the design review
  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { designReviewId } = req.params;
      const { status } = req.body;

      const updatedDesignReview = await DesignReviewsService.setStatus(
        req.currentUser,
        designReviewId,
        status,
        req.organization
      );
      return res.status(200).json(updatedDesignReview);
    } catch (error: unknown) {
      return next(error);
    }
  }
}
