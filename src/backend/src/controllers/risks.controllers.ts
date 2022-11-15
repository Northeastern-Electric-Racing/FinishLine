import { Request, Response } from 'express';
import { getCurrentUser } from '../utils/utils';
import { createRisk, deleteRisk, editRisk, getRisksForProject } from '../services/risks.services';
import { sendErrorResponse, sendSuccessJsonResponse, sendSuccessMessageResponse } from '../utils/response.utils';

export const getRisksForProjectController = async (req: Request, res: Response) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const risks = await getRisksForProject(projectId);
    sendSuccessJsonResponse(res, risks);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const createRiskController = async (req: Request, res: Response) => {
  try {
    const { projectId, detail } = req.body;
    const user = await getCurrentUser(res);

    const riskId = await createRisk(user, projectId, detail);

    sendSuccessMessageResponse(res, `Successfully created risk #${riskId}.`);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const editRiskController = async (req: Request, res: Response) => {
  try {
    const { id, detail, resolved } = req.body;
    const user = await getCurrentUser(res);

    const updatedRisk = await editRisk(user, id, detail, resolved);

    sendSuccessJsonResponse(res, updatedRisk);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};

export const deleteRiskController = async (req: Request, res: Response) => {
  try {
    const { riskId } = req.body;
    const user = await getCurrentUser(res);

    const deletedRisk = await deleteRisk(user, riskId);

    sendSuccessJsonResponse(res, deletedRisk);
  } catch (error: unknown) {
    sendErrorResponse(res, error);
  }
};
