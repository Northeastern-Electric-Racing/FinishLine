import { Prisma } from '@prisma/client';
import { ProposedSolution } from 'shared';
import { userTransformer } from './user.transformer';
import { ProposedSolutionQueryArgs } from '../prisma-query-args/proposed-solutions.query-args';

const proposedSolutionTransformer = (
  proposedSolution: Prisma.Proposed_SolutionGetPayload<ProposedSolutionQueryArgs>
): ProposedSolution => {
  return {
    id: proposedSolution.proposedSolutionId,
    description: proposedSolution.description,
    scopeImpact: proposedSolution.scopeImpact,
    budgetImpact: proposedSolution.budgetImpact,
    timelineImpact: proposedSolution.timelineImpact,
    createdBy: userTransformer(proposedSolution.createdBy),
    dateCreated: proposedSolution.dateCreated,
    approved: proposedSolution.approved
  };
};

export default proposedSolutionTransformer;
