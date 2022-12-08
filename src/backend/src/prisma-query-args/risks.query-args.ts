import { Prisma } from '@prisma/client';

const riskQueryArgs = Prisma.validator<Prisma.RiskArgs>()({
  include: {
    project: { include: { wbsElement: true } },
    createdBy: true,
    resolvedBy: true,
    deletedBy: true
  }
});

export default riskQueryArgs;
