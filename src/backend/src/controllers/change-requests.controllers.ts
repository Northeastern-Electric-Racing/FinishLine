import { Request, Response, NextFunction } from 'express';
import ChangeRequestsService from '../services/change-requests.services';

export default class ChangeRequestsController {
  static async getChangeRequestByID(req: Request, res: Response, next: NextFunction) {
    try {
      const { crId } = req.params;

      const cr = await ChangeRequestsService.getChangeRequestByID(crId, req.organization);
      return res.status(200).json(cr);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllChangeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const changeRequests = await ChangeRequestsService.getAllChangeRequests(req.organization);
      return res.status(200).json(changeRequests);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async reviewChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { crId, reviewNotes, accepted, psId } = req.body;
      const id = await ChangeRequestsService.reviewChangeRequest(
        req.currentUser,
        crId,
        reviewNotes,
        accepted,
        req.organization,
        psId
      );
      return res.status(200).json({ message: `Change request #${id} successfully reviewed.` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createActivationChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, type, leadId, managerId, startDate, confirmDetails } = req.body;

      const id = await ChangeRequestsService.createActivationChangeRequest(
        req.currentUser,
        wbsNum.carNumber,
        wbsNum.projectNumber,
        wbsNum.workPackageNumber,
        type,
        leadId,
        managerId,
        startDate,
        confirmDetails,
        req.organization
      );
      return res.status(200).json({ message: `Successfully created activation change request with id #${id}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createStageGateChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, type, confirmDone } = req.body;
      const id = await ChangeRequestsService.createStageGateChangeRequest(
        req.currentUser,
        wbsNum.carNumber,
        wbsNum.projectNumber,
        wbsNum.workPackageNumber,
        type,
        confirmDone,
        req.organization
      );
      return res.status(200).json({ message: `Successfully created stage gate request with id #${id}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async createStandardChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, type, what, why, proposedSolutions, projectProposedChanges, workPackageProposedChanges } = req.body;
      if (workPackageProposedChanges && workPackageProposedChanges.stage === 'NONE') {
        workPackageProposedChanges.stage = null;
      }

      const createdCR = await ChangeRequestsService.createStandardChangeRequest(
        req.currentUser,
        wbsNum.carNumber,
        wbsNum.projectNumber,
        wbsNum.workPackageNumber,
        type,
        what,
        why,
        proposedSolutions,
        req.organization,
        projectProposedChanges,
        workPackageProposedChanges
      );
      return res.status(200).json(createdCR);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async addProposedSolution(req: Request, res: Response, next: NextFunction) {
    try {
      const { crId, budgetImpact, description, timelineImpact, scopeImpact } = req.body;
      const id = await ChangeRequestsService.addProposedSolution(
        req.currentUser,
        crId,
        budgetImpact,
        description,
        timelineImpact,
        scopeImpact,
        req.organization
      );
      return res.status(200).json({ message: `Successfully added proposed solution with id #${id}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async deleteChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { crId } = req.params;

      await ChangeRequestsService.deleteChangeRequest(req.currentUser, crId, req.organization);
      return res.status(200).json({ message: `Successfully deleted change request #${crId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async requestCRReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const { crId } = req.params;

      await ChangeRequestsService.requestCRReview(req.currentUser, userIds, crId, req.organization);
      return res.status(200).json({ message: `Successfully requested reviewer(s) to change request #${crId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }
}
