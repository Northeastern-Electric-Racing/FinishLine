import { Prisma } from '@prisma/client';
import proposedSolutionArgs from './proposed-solutions.query-args';
import linkTypeQueryArgs from './link-types.query-args';

export const linkInfoQueryArgs = Prisma.validator<Prisma.LinkInfoArgs>()({
  include: {
    linkType: linkTypeQueryArgs
  }
});

export const projectProposedChangesQueryArgs = Prisma.validator<Prisma.Project_Proposed_ChangesArgs>()({
  include: {
    teams: { include: { members: true, head: true, leads: true } },
    goals: { where: { dateDeleted: null } },
    features: { where: { dateDeleted: null } },
    otherConstraints: { where: { dateDeleted: null } }
  }
});

export const workPackageProposedChangesQueryArgs = Prisma.validator<Prisma.Work_Package_Proposed_ChangesArgs>()({
  include: {
    blockedBy: true,
    expectedActivities: true,
    deliverables: true
  }
});

export const wbsProposedChangeQueryArgs = Prisma.validator<Prisma.Wbs_Proposed_ChangesArgs>()({
  include: {
    projectProposedChanges: projectProposedChangesQueryArgs,
    workPackageProposedChanges: workPackageProposedChangesQueryArgs,
    links: linkInfoQueryArgs,
    projectLead: true,
    projectManager: true
  }
});

const scopeChangeRequestQueryArgs = Prisma.validator<Prisma.Scope_CRArgs>()({
  include: {
    why: true,
    proposedSolutions: proposedSolutionArgs,
    wbsProposedChanges: {
      ...wbsProposedChangeQueryArgs
    }
  }
});

export default scopeChangeRequestQueryArgs;
