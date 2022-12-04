import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import { hasRiskPermissions, riskQueryArgs, riskTransformer } from '../utils/risks.utils';
import { Role } from '@prisma/client';
import { getCurrentUser } from '../utils/utils';

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
  const { body } = req;
  const { projectId, detail } = body;

  const user = await getCurrentUser(res);
  if (!user) return res.status(404).json({ message: 'User Not Found' });

  if (user.role === Role.GUEST) return res.status(403).json({ message: 'Access Denied' });

  const createdRisk = await prisma.risk.create({
    data: {
      project: { connect: { projectId } },
      detail,
      createdBy: { connect: { userId: user.userId } }
    }
  });

  return res.status(200).json({ message: `Successfully created risk #${createdRisk.id}.` });
};

export const editRisk = async (req: Request, res: Response) => {
  const { body } = req;
  const { userId, id, detail, resolved } = body;

  // get the original risk and check if it exists
  const originalRisk = await prisma.risk.findUnique({ where: { id } });
  if (!originalRisk) return res.status(404).json({ message: `Risk with id ${id} not found` });
  if (originalRisk.dateDeleted) {
    return res.status(400).json({ message: 'Cant edit a deleted risk' });
  }

  const hasPerms = await hasRiskPermissions(userId, originalRisk.projectId);
  if (!hasPerms) return res.status(403).json({ message: 'Access Denied' });

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

export const deleteRisk = async (req: Request, res: Response) => {
  const { body } = req;
  const { riskId } = body;

  const user = await getCurrentUser(res);
  if (!user) return res.status(404).json({ message: 'User Not Found' });

  const targetRisk = await prisma.risk.findUnique({ where: { id: riskId }, ...riskQueryArgs });

  if (!targetRisk) return res.status(404).json({ message: `risk with id ${riskId} not found` });

  if (targetRisk.dateDeleted || targetRisk.deletedBy) {
    return res.status(400).json({ message: 'this risk has already been deleted' });
  }

  const selfDelete = targetRisk.createdByUserId === user.userId;
  const hasPerms = await hasRiskPermissions(user.userId, targetRisk.projectId);
  if (!selfDelete && !hasPerms) return res.status(403).json({ message: 'Access Denied' });

  const updatedRisk = await prisma.risk.update({
    where: { id: riskId },
    data: {
      deletedByUserId: user.userId,
      dateDeleted: new Date()
    },
    ...riskQueryArgs
  });

  return res.status(200).json(riskTransformer(updatedRisk));
};
