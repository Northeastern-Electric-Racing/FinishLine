import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import { hasRiskPermissions, riskQueryArgs, riskTransformer } from '../utils/risks.utils';
import { validationResult } from 'express-validator';

export const getRisksForProject = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const requestedProject = await prisma.project.findUnique({ where: { projectId } });

  if (!requestedProject) {
    return res.status(404).json({ message: `Project with id ${projectId} not found!` });
  }

  const risks = await prisma.risk.findMany({ where: { projectId }, ...riskQueryArgs });

  return res.status(200).json(risks.map(riskTransformer));
};

export const createRisk = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  const { projectId, detail, createdById } = body;

  const targetProj = await prisma.project.findUnique({ where: { projectId } });

  const targetUser = await prisma.user.findUnique({ where: { userId: createdById } });

  if (!targetProj) {
    return res.status(404).json({ message: `project with id #${projectId} not found!` });
  }

  if (!targetUser) {
    return res.status(404).json({ message: `user with id #${projectId} not found!` });
  }

  const createdRisk = await prisma.risk.create({
    data: {
      project: { connect: { projectId } },
      detail,
      createdBy: { connect: { userId: createdById } }
    }
  });

  return res.status(200).json({ message: `Successfully created risk #${createdRisk.id}.` });
};

export const editRisk = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  const { userId, id, detail, resolved } = body;

  // get the original risk and check if it exists
  const originalRisk = await prisma.risk.findUnique({ where: { id } });
  if (!originalRisk) return res.status(404).json({ message: `Risk with id ${id} not found` });
  if (originalRisk.dateDeleted) {
    return res.status(400).json({ message: 'Cant edit a deleted risk' });
  }

  if (!hasRiskPermissions(userId, originalRisk.projectId)) {
    return res.status(401).json({ message: 'Access Denied' });
  }

  let updatedRisk;

  if (originalRisk.isResolved && !resolved) {
    // if the risk is already resolved and we are unresolving it, we need to take away the resolved data in the db
    updatedRisk = await prisma.risk.update({
      where: { id },
      data: {
        detail,
        isResolved: resolved,
        resolvedByUserId: null,
        resolvedAt: null
      },
      ...riskQueryArgs
    });
  } else if (!originalRisk.isResolved && resolved) {
    // if it's not resolved and we're resolving it, we need to set the resolved data in the db
    updatedRisk = await prisma.risk.update({
      where: { id },
      data: {
        detail,
        isResolved: resolved,
        resolvedByUserId: userId,
        resolvedAt: new Date()
      },
      ...riskQueryArgs
    });
  } else {
    // any other case we are only changing the detail
    updatedRisk = await prisma.risk.update({
      where: { id },
      data: {
        detail
      },
      ...riskQueryArgs
    });
  }

  // return the updated risk
  return res.status(200).json(riskTransformer(updatedRisk));
};
