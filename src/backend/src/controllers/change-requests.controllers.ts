import { Request, Response, NextFunction } from 'express';
import ChangeRequestsService from '../services/change-requests.services';
import { getCurrentUser } from '../utils/auth.utils';
import { User } from '@prisma/client';

export default class ChangeRequestsController {
  static async getChangeRequestByID(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const { crId } = req.params;

      const cr = await ChangeRequestsService.getChangeRequestByID(crId, req.organization);
      return res.status(200).json(cr);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async getAllChangeRequests(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const changeRequests = await ChangeRequestsService.getAllChangeRequests(req.organization);
      return res.status(200).json(changeRequests);
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async reviewChangeRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { crId, reviewNotes, accepted, psId } = req.body;
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const reviewer = await getCurrentUser(res);
      const id = await ChangeRequestsService.reviewChangeRequest(
        reviewer,
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
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const id = await ChangeRequestsService.createActivationChangeRequest(
        submitter,
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
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const id = await ChangeRequestsService.createStageGateChangeRequest(
        submitter,
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
      const submitter = await getCurrentUser(res);
      if (workPackageProposedChanges && workPackageProposedChanges.stage === 'NONE') {
        workPackageProposedChanges.stage = null;
      }
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      const createdCR = await ChangeRequestsService.createStandardChangeRequest(
        submitter,
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
      const submitter = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }
      const id = await ChangeRequestsService.addProposedSolution(
        submitter,
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
      const user: User = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      await ChangeRequestsService.deleteChangeRequest(user, crId, req.organization);
      return res.status(200).json({ message: `Successfully deleted change request #${crId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }

  static async requestCRReview(req: Request, res: Response, next: NextFunction) {
    try {
      const { userIds } = req.body;
      const { crId } = req.params;
      const submitter: User = await getCurrentUser(res);
      if (!req.organization) {
        return res.status(400).json({ message: 'Organization not found' });
      }

      await ChangeRequestsService.requestCRReview(submitter, userIds, crId, req.organization);
      return res.status(200).json({ message: `Successfully requested reviewer(s) to change request #${crId}` });
    } catch (error: unknown) {
      return next(error);
    }
  }
}
