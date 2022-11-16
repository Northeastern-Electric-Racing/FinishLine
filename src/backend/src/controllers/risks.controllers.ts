import { NextFunction, Request, Response } from 'express';
import { getCurrentUser } from '../utils/utils';
import RisksService from '../services/risks.services';
import { sendSuccessJsonResponse, sendSuccessMessageResponse } from '../utils/response.utils';

export default class RisksController {
  static async getRisksForProject(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = parseInt(req.params.projectId);
      const risks = await RisksService.getRisksForProject(projectId);
      sendSuccessJsonResponse(res, risks);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId, detail } = req.body;
      const user = await getCurrentUser(res);

      const riskId = await RisksService.createRisk(user, projectId, detail);

      sendSuccessMessageResponse(res, `Successfully created risk #${riskId}.`);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const { id, detail, resolved } = req.body;
      const user = await getCurrentUser(res);

      const updatedRisk = await RisksService.editRisk(user, id, detail, resolved);

      sendSuccessJsonResponse(res, updatedRisk);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const { riskId } = req.body;
      const user = await getCurrentUser(res);

      const deletedRisk = await RisksService.deleteRisk(user, riskId);

      sendSuccessJsonResponse(res, deletedRisk);
    } catch (error: unknown) {
      next(error);
    }
  }
}
