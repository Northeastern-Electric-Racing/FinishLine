import { NextFunction, Request, Response } from 'express';
import DesignReviewsService from '../services/design-reviews.services';
import { getCurrentUser } from '../utils/auth.utils';

export default class DesignReviewsController {
  // Edit a work package to the given specifications
  static async editDesignReviews(req: Request, res: Response, next: NextFunction) {
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
        attendees,
        meetingTimes
      } = req.body;

      const { designReviewId } = req.params;

      // get the user from the header
      const user = await getCurrentUser(res);

      await DesignReviewsService.editDesignReviews(
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
        attendees,
        meetingTimes
      );
      return res.status(200).json({ message: 'Design Review updated successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }
}
