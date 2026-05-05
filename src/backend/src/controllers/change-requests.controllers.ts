import { Request, Response, NextFunction } from 'express';
import ChangeRequestsService from '../services/change-requests.services.js';
import { validateWBS, WbsNumber } from 'shared';

export default class ChangeRequestsController {
  static async getChangeRequestByID(req: Request, res: Response, next: NextFunction) {
    try {
      const { crId } = req.params as Record<string, string>;

      const cr = await ChangeRequestsService.getChangeRequestByID(crId, req.organization);
      res.status(200).json(cr);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllChangeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const changeRequests = await ChangeRequestsService.getAllChangeRequests(req.organization, req.currentCar?.carId);
      res.status(200).json(changeRequests);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllGuestChangeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const changeRequests = await ChangeRequestsService.getAllGuestChangeRequests(req.organization);
      res.status(200).json(changeRequests);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getToReviewChangeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const changeRequests = await ChangeRequestsService.getToReviewChangeRequests(
        req.currentUser,
        req.organization,
        req.currentCar?.carId
      );
      res.status(200).json(changeRequests);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUnreviewedChangeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsnum } = req.query;
      let validatedWbs: WbsNumber | undefined;
      if (wbsnum) validatedWbs = validateWBS(wbsnum as string);

      const changeRequests = await ChangeRequestsService.getUnreviewedChangeRequests(
        req.currentUser,
        validatedWbs,
        req.organization,
        req.currentCar?.carId
      );
      res.status(200).json(changeRequests);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getApprovedChangeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsnum } = req.query;
      let validatedWbs: WbsNumber | undefined;
      if (wbsnum) validatedWbs = validateWBS(wbsnum as string);

      const changeRequests = await ChangeRequestsService.getApprovedChangeRequests(
        req.currentUser,
        validatedWbs,
        req.organization,
        req.currentCar?.carId
      );
      res.status(200).json(changeRequests);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async reviewChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { crId, reviewNotes, accepted } = req.body;
      const id = await ChangeRequestsService.reviewChangeRequest(
        req.currentUser,
        crId,
        accepted,
        req.organization,
        reviewNotes
      );
      res.status(200).json({ message: `Change request #${id} successfully reviewed.` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createActivationChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, leadId, managerId, startDate, confirmDetails } = req.body;

      const id = await ChangeRequestsService.createActivationChangeRequest(
        req.currentUser,
        wbsNum.carNumber,
        wbsNum.projectNumber,
        wbsNum.workPackageNumber,
        leadId,
        managerId,
        startDate,
        confirmDetails,
        req.organization
      );
      res.status(200).json({ message: `Successfully created activation change request with id #${id}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createStageGateChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, confirmDone, dateCompleted } = req.body;
      const id = await ChangeRequestsService.createStageGateChangeRequest(
        req.currentUser,
        wbsNum.carNumber,
        wbsNum.projectNumber,
        wbsNum.workPackageNumber,
        confirmDone,
        new Date(dateCompleted),
        req.organization
      );
      res.status(200).json({ message: `Successfully created stage gate request with id #${id}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createBudgetChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { otherReasonId, accountCodeId, proposedBudget } = req.body;
      const cr = await ChangeRequestsService.createBudgetChangeRequest(
        req.currentUser,
        proposedBudget,
        req.organization,
        otherReasonId,
        accountCodeId
      );
      res.status(200).json(cr);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createLeadershipChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, leadId, managerId } = req.body;

      const cr = await ChangeRequestsService.createLeadershipChangeRequest(
        req.currentUser,
        wbsNum.carNumber,
        wbsNum.projectNumber,
        wbsNum.workPackageNumber,
        leadId,
        managerId,
        req.organization
      );
      res.status(200).json(cr);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createStandardChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, why, requestedReviewerId, projectProposedChanges, workPackageProposedChanges } = req.body;
      if (workPackageProposedChanges && workPackageProposedChanges.stage === 'NONE') {
        workPackageProposedChanges.stage = null;
      }

      const createdCR = await ChangeRequestsService.createStandardChangeRequest(
        req.currentUser,
        wbsNum.carNumber,
        wbsNum.projectNumber,
        wbsNum.workPackageNumber,
        why,
        req.organization,
        requestedReviewerId,
        projectProposedChanges,
        workPackageProposedChanges
      );
      res.status(200).json(createdCR);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { crId } = req.params as Record<string, string>;

      await ChangeRequestsService.deleteChangeRequest(req.currentUser, crId, req.organization);
      res.status(200).json({ message: `Successfully deleted change request #${crId}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async requestCRReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const { crId } = req.params as Record<string, string>;

      await ChangeRequestsService.requestCRReview(req.currentUser, userIds, crId, req.organization);
      res.status(200).json({ message: `Successfully requested reviewer(s) to change request #${crId}` });
    } catch (error: unknown) {
      next(error);
    }
  }
}
