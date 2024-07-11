import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type ProposedSolutionQueryArgs = ReturnType<typeof getProposedSolutionQueryArgs>;

export const getProposedSolutionQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Proposed_SolutionDefaultArgs>()({
    include: {
      createdBy: getUserQueryArgs(organizationId)
    }
  });
