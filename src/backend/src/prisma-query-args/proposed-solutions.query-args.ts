import { Prisma } from '@prisma/client';
const proposedSolutionArgs = Prisma.validator<Prisma.Proposed_SolutionArgs>()({
  include: {
    createdBy: true
  }
});

export default proposedSolutionArgs;
