import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import { riskQueryArgs, riskTransformer } from '../utils/risks.utils';
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

export const deleteRisk = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { body } = req;
  const { riskId, deletedByUserId } = body;

  const targetRisk = await prisma.risk.findUnique({ where: { id: riskId }, ...riskQueryArgs });

  if (!targetRisk) return res.status(404).json({ message: `risk with id ${riskId} not found` });

  if (targetRisk.dateDeleted || targetRisk.deletedBy) {
    return res.status(400).json({ message: 'this risk has already been deleted' });
  }

  const updatedRisk = await prisma.risk.update({
    where: { id: riskId },
    data: {
      deletedByUserId,
      dateDeleted: new Date()
    },
    ...riskQueryArgs
  });

  return res.status(200).json(riskTransformer(updatedRisk));
};
