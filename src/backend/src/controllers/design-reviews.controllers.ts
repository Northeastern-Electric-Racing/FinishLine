import { NextFunction, Request, Response } from 'express';
import DesignReviewsService from '../services/design-reviews.services';
import { getCurrentUser, getCurrentUserWithUserSettings } from '../utils/auth.utils';
import { User } from '@prisma/client';
import { getOrganizationId } from '../utils/utils';

export default class DesignReviewsController {
  static async getAllDesignReviews(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = getOrganizationId(req.headers);
      const designReviews = await DesignReviewsService.getAllDesignReviews(organizationId);
      return res.status(200).json(designReviews);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const drId: string = req.params.designReviewId;
      const user: User = await getCurrentUser(res);
      const organizationId = getOrganizationId(req.headers);
      const deletedDesignReview = await DesignReviewsService.deleteDesignReview(user, drId, organizationId);
      return res.status(200).json(deletedDesignReview);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const submitter: User = await getCurrentUser(res);
      const { dateScheduled, teamTypeId, requiredMemberIds, optionalMemberIds, wbsNum, meetingTimes } = req.body;
      const organizationId = getOrganizationId(req.headers);

      const createdDesignReview = await DesignReviewsService.createDesignReview(
        submitter,
        dateScheduled,
        teamTypeId,
        requiredMemberIds,
        optionalMemberIds,
        wbsNum,
        meetingTimes,
        organizationId
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
      const organizationId = getOrganizationId(req.headers);

      const designReview = await DesignReviewsService.getSingleDesignReview(user, drId, organizationId);
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
      const organizationId = getOrganizationId(req.headers);

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
        meetingTimes,
        organizationId
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
      const organizationId = getOrganizationId(req.headers);
      const user = await getCurrentUserWithUserSettings(res);

      const updatedDesignReview = await DesignReviewsService.markUserConfirmed(
        designReviewId,
        availability,
        user,
        organizationId
      );
      return res.status(200).json(updatedDesignReview);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Set a new status for the design review
  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { designReviewId } = req.params;
      const { status } = req.body;
      const user = await getCurrentUser(res);

      const updatedDesignReview = await DesignReviewsService.setStatus(user, designReviewId, status);
      return res.status(200).json(updatedDesignReview);
    } catch (error: unknown) {
      next(error);
    }
  }
}
