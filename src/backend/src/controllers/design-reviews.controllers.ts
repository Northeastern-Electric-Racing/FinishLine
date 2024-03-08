import { NextFunction, Request, Response } from 'express';
import {} from 'shared';
import DesignReviewService from '../services/design-reviews.services';
import { getCurrentUser } from '../utils/auth.utils';

export default class DesignReviewController {
  // Edit a work package to the given specifications
  static async editDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        dateScheduled,
        teamType,
        requiredMembers,
        optionalMembers,
        isOnline,
        isInPerson,
        zoomLink,
        location,
        docTemplateLink,
        status,
        confirmedMembers,
        deniedMembers,
        attendees,
        meetingTimes
      } = req.body;

      const { designReviewId } = req.params;

      // get the user from the header
      const user = await getCurrentUser(res);

      await DesignReviewService.editDesignReview(
        user,
        designReviewId,
        dateScheduled,
        teamType.teamTypeId,
        requiredMembers,
        optionalMembers,
        isOnline,
        isInPerson,
        zoomLink,
        location,
        docTemplateLink,
        status,
        confirmedMembers,
        deniedMembers,
        attendees,
        meetingTimes
      );
      return res.status(200).json({ message: 'Design Review updated successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }
}
