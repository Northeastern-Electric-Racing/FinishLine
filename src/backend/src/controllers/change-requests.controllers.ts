import { Request, Response, NextFunction } from 'express';
import ChangeRequestService from '../services/change-request.services';

export default class CRController {
  // Fetch the specific change request by its integer ID
  static async getChangeRequestByID(req: Request, res: Response, next: NextFunction) {
    try {
      const crId: number = parseInt(req.params.crId);
      const cr = await ChangeRequestService.getChangeRequestByID(crId);
      return res.status(200).json(cr);
    } catch (error: unknown) {
      next(error);
    }
  }
  static async getAllChangeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const changeRequests = await ChangeRequestService.getAllChangeRequests();
      return res.status(200).json(changeRequests);
    } catch (error: unknown) {
      next(error);
    }
  }
  // handle reviewing of change requests
  static async reviewChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const { reviewerId, crId, reviewNotes, accepted, psId } = body;
      const id = await ChangeRequestService.reviewChangeRequest(reviewerId, crId, reviewNotes, accepted, psId);
      return res.status(200).json({ message: `Change request #${id} successfully reviewed.` });
    } catch (error: unknown) {
      next(error);
    }
  }
  static async createActivationChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const id = ChangeRequestService.createActivationChangeRequest(
        body.submitterId,
        body.wbsNum.carNumber,
        body.wbsNum.projectNumber,
        body.wbsNum.workPackageNumber,
        body.type,
        body.projectLeadId,
        body.projectManagerId,
        body.startDate,
        body.confirmDetails
      );
      return res.status(200).json({ message: `Successfully created activation change request with id #${id}` });
    } catch (error: unknown) {
      next(error);
    }
  }
  static async createStageGateChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const id = ChangeRequestService.createStageGateChangeRequest(
        body.submitterId,
        body.wbsNum.carNumber,
        body.wbsNum.projectNumber,
        body.wbsNum.workPackageNumber,
        body.type,
        body.leftoverBudget,
        body.confirmDone
      );
      return res.status(200).json({ message: `Successfully created stage gate request with id #${id}` });
    } catch (error: unknown) {
      next(error);
    }
  }
  static async createStandardChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const id = ChangeRequestService.createStandardChangeRequest(
        body.submitterId,
        body.wbsNum.carNumber,
        body.wbsNum.projectNumber,
        body.wbsNum.workPackageNumber,
        body.type,
        body.what,
        body.why,
        body.budgetImpact
      );
      return res.status(200).json({ message: `Successfully created standard change request with id #${id}` });
    } catch (error: unknown) {
      next(error);
    }
  }
  static async addProposedSolution(req: Request, res: Response, next: NextFunction) {
    try {
      const { body } = req;
      const id = ChangeRequestService.addProposedSolution(
        body.submitterId,
        body.crId,
        body.budgetImpact,
        body.description,
        body.timelineImpact,
        body.scopeImpact
      );
      return res.status(200).json({ message: `Successfully added proposed solution with id #${id}` });
    } catch (error: unknown) {
      next(error);
    }
  }
}
