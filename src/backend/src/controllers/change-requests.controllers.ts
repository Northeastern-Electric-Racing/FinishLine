import { Request, Response, NextFunction } from 'express';
import ChangeRequestsService from '../services/change-request.services';
import { getCurrentUser } from '../utils/auth.utils';

export default class ChangeRequestsController {
  static async getChangeRequestByID(req: Request, res: Response, next: NextFunction) {
    try {
      const crId: number = parseInt(req.params.crId);
      const cr = await ChangeRequestsService.getChangeRequestByID(crId);
      return res.status(200).json(cr);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllChangeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const changeRequests = await ChangeRequestsService.getAllChangeRequests();
      return res.status(200).json(changeRequests);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async reviewChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { crId, reviewNotes, accepted, psId } = req.body;
      const reviewer = await getCurrentUser(res);
      const id = await ChangeRequestsService.reviewChangeRequest(reviewer, crId, reviewNotes, accepted, psId);
      return res.status(200).json({ message: `Change request #${id} successfully reviewed.` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createActivationChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, type, projectLeadId, projectManagerId, startDate, confirmDetails } = req.body;
      const submitter = await getCurrentUser(res);
      const id = await ChangeRequestsService.createActivationChangeRequest(
        submitter,
        wbsNum.carNumber,
        wbsNum.projectNumber,
        wbsNum.workPackageNumber,
        type,
        projectLeadId,
        projectManagerId,
        startDate,
        confirmDetails
      );
      return res.status(200).json({ message: `Successfully created activation change request with id #${id}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createStageGateChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, type, leftoverBudget, confirmDone } = req.body;
      const submitter = await getCurrentUser(res);
      const id = await ChangeRequestsService.createStageGateChangeRequest(
        submitter,
        wbsNum.carNumber,
        wbsNum.projectNumber,
        wbsNum.workPackageNumber,
        type,
        leftoverBudget,
        confirmDone
      );
      return res.status(200).json({ message: `Successfully created stage gate request with id #${id}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createStandardChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { wbsNum, type, what, why } = req.body;
      const submitter = await getCurrentUser(res);
      const id = await ChangeRequestsService.createStandardChangeRequest(
        submitter,
        wbsNum.carNumber,
        wbsNum.projectNumber,
        wbsNum.workPackageNumber,
        type,
        what,
        why
      );
      return res.status(200).json({ message: `${id}` });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async addProposedSolution(req: Request, res: Response, next: NextFunction) {
    try {
      const { crId, budgetImpact, description, timelineImpact, scopeImpact } = req.body;
      const submitter = await getCurrentUser(res);
      const id = await ChangeRequestsService.addProposedSolution(
        submitter,
        crId,
        budgetImpact,
        description,
        timelineImpact,
        scopeImpact
      );
      return res.status(200).json({ message: `Successfully added proposed solution with id #${id}` });
    } catch (error: unknown) {
      next(error);
    }
  }
}
