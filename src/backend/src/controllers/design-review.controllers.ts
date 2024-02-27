import { NextFunction, Request, Response } from 'express';
import {} from 'shared';
import DesignReviewService from '../services/design-review.services';
import { getCurrentUser } from '../utils/auth.utils';

export default class DesignReviewController {
  // Edit a work package to the given specifications
  static async editDesignReview(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        dateScheduled,
        teamType,
        requiredMembers,
        optionaldMembers,
        online,
        isInPeron,
        zoomLink,
        docTemplateLink,
        status,
        confirmedMembers,
        deniedMembers,
        attendees,
        meetingTime
      } = req.body;

      const { designReviewId } = req.params;

      const user = await getCurrentUser(res);

      await DesignReviewService.editDesignReview(
        user,
        designReviewId,
        dateScheduled,
        teamType.teamTypeId,
        requiredMembers,
        optionaldMembers,
        online,
        isInPeron,
        zoomLink,
        docTemplateLink,
        status,
        confirmedMembers,
        deniedMembers,
        attendees,
        meetingTime
      );
      return res.status(200).json({ message: 'Design Review updated successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }
}
