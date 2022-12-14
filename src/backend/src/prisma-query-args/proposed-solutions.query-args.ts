import { Prisma } from '@prisma/client';

const proposedSolutionQueryArgs = Prisma.validator<Prisma.Proposed_SolutionArgs>()({
  include: {
    createdBy: true
  }
});

export default proposedSolutionQueryArgs;
