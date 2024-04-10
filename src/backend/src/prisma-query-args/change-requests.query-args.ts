import { Prisma } from '@prisma/client';
import scopeCRArgs from './scope-change-requests.query-args';
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
    proposedProjectChanges: projectProposedChangesQueryArgs,
    workPackageProposedChanges: workPackageProposedChangesQueryArgs,
    links: linkInfoQueryArgs,
    projectLead: true,
    projectManager: true
  }
});

export const changeRequestQueryArgs = Prisma.validator<Prisma.Change_RequestArgs>()({
  include: {
    submitter: true,
    wbsElement: true,
    reviewer: true,
    changes: {
      where: {
        wbsElement: {
          dateDeleted: null
        }
      },
      include: {
        implementer: true,
        wbsElement: true
      }
    },
    scopeChangeRequest: scopeCRArgs,
    stageGateChangeRequest: true,
    activationChangeRequest: { include: { projectLead: true, projectManager: true } },
    deletedBy: true,
    requestedReviewers: true,
    wbsProposedChanges: {
      ...wbsProposedChangeQueryArgs
    }
  }
});
