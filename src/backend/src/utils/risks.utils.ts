import { Prisma, Role } from '@prisma/client';
import prisma from '../prisma/prisma';
import { Risk } from 'shared';
import { userTransformer } from './users.utils';
import { wbsNumOf } from './utils';

export const riskQueryArgs = Prisma.validator<Prisma.RiskArgs>()({
  include: {
    project: { include: { wbsElement: true } },
    createdBy: true,
    resolvedBy: true,
    deletedBy: true
  }
});

export const riskTransformer = (risk: Prisma.RiskGetPayload<typeof riskQueryArgs>): Risk => {
  return {
    id: risk.id,
    project: {
      id: risk.project.projectId,
      name: risk.project.wbsElement.name,
      wbsNum: wbsNumOf(risk.project.wbsElement)
    },
    detail: risk.detail,
    isResolved: risk.isResolved,
    dateDeleted: risk.dateDeleted ?? undefined,
    dateCreated: risk.dateCreated,
    createdBy: userTransformer(risk.createdBy),
    resolvedBy: risk.resolvedBy ? userTransformer(risk.resolvedBy) : undefined,
    resolvedAt: risk.resolvedAt ?? undefined,
    deletedBy: risk.deletedBy ? userTransformer(risk.deletedBy) : undefined
  };
};

export const hasRiskPermissions = async (userId: number, projectId: number) => {
  const user = await prisma.user.findUnique({ where: { userId } });

  if (!user) return false;

  if (user.role === Role.APP_ADMIN || user.role === Role.ADMIN || user.role === Role.LEADERSHIP) {
    return true;
  }

  const project = await prisma.project.findUnique({
    where: { projectId },
    include: { wbsElement: true }
  });

  if (!project) return false;

  if (
    project.wbsElement.projectLeadId === user.userId ||
    project.wbsElement.projectManagerId === user.userId
  ) {
    return true;
  }

  return false;
};
