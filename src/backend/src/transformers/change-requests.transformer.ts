import { Prisma } from '@prisma/client';
import { ChangeRequest, StandardChangeRequest, ActivationChangeRequest, StageGateChangeRequest } from 'shared';
import changeRequestRelationArgs from '../prisma-query-args/change-requests.query-args';
import { wbsNumOf } from '../utils/utils';
import { userTransformer } from '../utils/users.utils';
import { convertCRScopeWhyType } from '../utils/change-requests.utils';
import proposedSolutionTransformer from './proposed-solutions.transformer';

const changeRequestTransformer = (
  changeRequest: Prisma.Change_RequestGetPayload<typeof changeRequestRelationArgs>
): ChangeRequest | StandardChangeRequest | ActivationChangeRequest | StageGateChangeRequest => {
  return {
    // all cr fields
    crId: changeRequest.crId,
    wbsNum: wbsNumOf(changeRequest.wbsElement),
    wbsName: changeRequest.wbsElement.name,
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
    proposedSolutions: changeRequest.scopeChangeRequest
      ? changeRequest.scopeChangeRequest?.proposedSolutions.map(proposedSolutionTransformer) ?? []
      : undefined,
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

export default changeRequestTransformer;
