import { Prisma } from '@prisma/client';
import proposedSolutionArgs from './proposed-solutions.query-args';

const scopeCRArgs = Prisma.validator<Prisma.Scope_CRArgs>()({
  include: {
    why: true,
    proposedSolutions: proposedSolutionArgs
  }
});

export default scopeCRArgs;
