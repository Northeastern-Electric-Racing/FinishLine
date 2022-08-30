import { Prisma, Scope_CR_Why_Type } from '@prisma/client';
import {
  ActivationChangeRequest,
  ChangeRequest,
  ChangeRequestReason,
  ProposedSolution,
  StageGateChangeRequest,
  StandardChangeRequest
} from 'shared';
import { userTransformer } from './users.utils';
import { wbsNumOf } from './utils';

export const convertCRScopeWhyType = (whyType: Scope_CR_Why_Type): ChangeRequestReason =>
  ({
    ESTIMATION: ChangeRequestReason.Estimation,
    SCHOOL: ChangeRequestReason.School,
    DESIGN: ChangeRequestReason.Design,
    MANUFACTURING: ChangeRequestReason.Manufacturing,
    RULES: ChangeRequestReason.Rules,
    INITIALIZATION: ChangeRequestReason.Initialization,
    COMPETITION: ChangeRequestReason.Competition,
    MAINTENANCE: ChangeRequestReason.Maintenance,
    OTHER_PROJECT: ChangeRequestReason.OtherProject,
    OTHER: ChangeRequestReason.Other
  }[whyType]);

export const proposedSolutionArgs = Prisma.validator<Prisma.Proposed_SolutionArgs>()({
  include: {
    createdBy: true
  }
});

export const scopeCRArgs = Prisma.validator<Prisma.Scope_CRArgs>()({
  include: {
    why: true,
    proposedSolutions: proposedSolutionArgs
  }
});

export const changeRequestRelationArgs = Prisma.validator<Prisma.Change_RequestArgs>()({
  include: {
    submitter: true,
    wbsElement: true,
    reviewer: true,
    changes: {
      include: {
        implementer: true,
        wbsElement: true
      }
    },
    scopeChangeRequest: scopeCRArgs,
    stageGateChangeRequest: true,
    activationChangeRequest: { include: { projectLead: true, projectManager: true } }
  }
});

export const proposedSolutionTransformer = (
  proposedSolution: Prisma.Proposed_SolutionGetPayload<typeof proposedSolutionArgs>
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

export const changeRequestTransformer = (
  changeRequest: Prisma.Change_RequestGetPayload<typeof changeRequestRelationArgs>
): ChangeRequest | StandardChangeRequest | ActivationChangeRequest | StageGateChangeRequest => {
  return {
    // all cr fields
    crId: changeRequest.crId,
    wbsNum: wbsNumOf(changeRequest.wbsElement),
    submitter: userTransformer(changeRequest.submitter),
    dateSubmitted: changeRequest.dateSubmitted,
    type: changeRequest.type,
    reviewer: changeRequest.reviewer ? userTransformer(changeRequest.reviewer) : undefined,
    dateReviewed: changeRequest.dateReviewed ?? undefined,
    accepted: changeRequest.accepted ?? undefined,
    reviewNotes: changeRequest.reviewNotes ?? undefined,
    dateImplemented: changeRequest.changes.reduce(
      (res: Date | undefined, change) =>
        !res || change.dateImplemented.valueOf() > res.valueOf() ? change.dateImplemented : res,
      undefined
    ),
    implementedChanges: changeRequest.changes.map((change) => ({
      wbsNum: wbsNumOf(change.wbsElement),
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    // scope cr fields
    what: changeRequest.scopeChangeRequest?.what ?? undefined,
    why: changeRequest.scopeChangeRequest?.why.map((why) => ({
      type: convertCRScopeWhyType(why.type),
      explain: why.explain
    })),
    scopeImpact: changeRequest.scopeChangeRequest?.scopeImpact ?? undefined,
    budgetImpact: changeRequest.scopeChangeRequest?.budgetImpact ?? undefined,
    timelineImpact: changeRequest.scopeChangeRequest?.timelineImpact ?? undefined,
    proposedSolutions:
      changeRequest.scopeChangeRequest?.proposedSolutions.map(proposedSolutionTransformer) ?? [],
    // activation cr fields
    projectLead: changeRequest.activationChangeRequest?.projectLead
      ? userTransformer(changeRequest.activationChangeRequest?.projectLead)
      : undefined,
    projectManager: changeRequest.activationChangeRequest?.projectManager
      ? userTransformer(changeRequest.activationChangeRequest?.projectManager)
      : undefined,
    startDate: changeRequest.activationChangeRequest?.startDate ?? undefined,
    confirmDetails: changeRequest.activationChangeRequest?.confirmDetails ?? undefined,
    // stage gate cr fields
    leftoverBudget: changeRequest.stageGateChangeRequest?.leftoverBudget ?? undefined,
    confirmDone: changeRequest.stageGateChangeRequest?.confirmDone ?? undefined
  };
};
