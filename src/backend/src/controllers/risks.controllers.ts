import prisma from '../prisma/prisma';
import { Request, Response } from 'express';
import { riskQueryArgs, riskTransformer } from '../utils/risks.utils';

export const getRisksForProject = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.projectId);
  const requestedProject = await prisma.project.findUnique({ where: { projectId } });

  if (!requestedProject) {
    return res.status(404).json({ message: `Project with id ${projectId} not found!` });
  }

  const risks = await prisma.risk.findMany({ where: { projectId }, ...riskQueryArgs });

  return res.status(200).json(risks.map(riskTransformer));
};
