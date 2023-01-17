import { Prisma } from '@prisma/client';
import { Risk } from 'shared';
import { wbsNumOf } from '../utils/utils';
import riskQueryArgs from '../prisma-query-args/risks.query-args';
import userTransformer from './user.transformer';

const riskTransformer = (risk: Prisma.RiskGetPayload<typeof riskQueryArgs>): Risk => {
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

export default riskTransformer;
