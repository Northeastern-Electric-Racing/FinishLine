import { Prisma } from '@prisma/client';
import {
  ChangeRequest,
  StandardChangeRequest,
  ActivationChangeRequest,
  StageGateChangeRequest,
  ProjectProposedChanges,
  WbsElementStatus,
  WorkPackageProposedChanges,
  WorkPackageStage
} from 'shared';
import { wbsNumOf } from '../utils/utils';
import { calculateChangeRequestStatus, convertCRScopeWhyType } from '../utils/change-requests.utils';
import proposedSolutionTransformer from './proposed-solutions.transformer';
import { getDateImplemented } from '../utils/change-requests.utils';
import { userTransformer } from './user.transformer';
import { changeRequestQueryArgs } from '../prisma-query-args/change-requests.query-args';
import { descBulletConverter } from '../utils/description-bullets.utils';
import { wbsProposedChangeQueryArgs } from '../prisma-query-args/scope-change-requests.query-args';
import { linkTransformer } from './links.transformer';

export const projectProposedChangesTransformer = (
  wbsProposedChanges: Prisma.Wbs_Proposed_ChangesGetPayload<typeof wbsProposedChangeQueryArgs>
): ProjectProposedChanges => {
  const { projectProposedChanges } = wbsProposedChanges;
  return {
    id: wbsProposedChanges.wbsProposedChangesId,
    name: wbsProposedChanges.name,
    status: wbsProposedChanges.status as WbsElementStatus,
    links: wbsProposedChanges.links.map(linkTransformer),
    lead: wbsProposedChanges.lead ? wbsProposedChanges.lead : undefined,
    manager: wbsProposedChanges.manager ? wbsProposedChanges.manager : undefined,
    summary: projectProposedChanges!.summary,
    budget: projectProposedChanges!.budget,
    rules: projectProposedChanges!.rules,
    goals: projectProposedChanges!.goals.map(descBulletConverter),
    features: projectProposedChanges!.features.map(descBulletConverter),
    otherConstraints: projectProposedChanges!.otherConstraints.map(descBulletConverter),
    teams: projectProposedChanges!.teams,
    carNumber: projectProposedChanges?.carNumber !== null ? projectProposedChanges?.carNumber : undefined
  };
};

export const workPackageProposedChangesTransformer = (
  wbsProposedChanges: Prisma.Wbs_Proposed_ChangesGetPayload<typeof wbsProposedChangeQueryArgs>
): WorkPackageProposedChanges => {
  const { workPackageProposedChanges } = wbsProposedChanges;
  return {
    id: wbsProposedChanges.wbsProposedChangesId,
    name: wbsProposedChanges.name,
    status: wbsProposedChanges.status as WbsElementStatus,
    links: wbsProposedChanges.links.map(linkTransformer),
    lead: wbsProposedChanges.lead ? wbsProposedChanges.lead : undefined,
    manager: wbsProposedChanges.manager ? wbsProposedChanges.manager : undefined,
    startDate: workPackageProposedChanges!.startDate,
    duration: workPackageProposedChanges!.duration,
    blockedBy: workPackageProposedChanges!.blockedBy.map(wbsNumOf),
    expectedActivities: workPackageProposedChanges!.expectedActivities.map(descBulletConverter),
    deliverables: workPackageProposedChanges!.deliverables.map(descBulletConverter),
    stage: (workPackageProposedChanges!.stage as WorkPackageStage) || undefined
  };
};

const changeRequestTransformer = (
  changeRequest: Prisma.Change_RequestGetPayload<typeof changeRequestQueryArgs>
): ChangeRequest | StandardChangeRequest | ActivationChangeRequest | StageGateChangeRequest => {
  const status = calculateChangeRequestStatus(changeRequest);

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
    dateImplemented: getDateImplemented(changeRequest),
    implementedChanges: changeRequest.changes.map((change) => ({
      wbsNum: wbsNumOf(change.wbsElement),
      changeId: change.changeId,
      changeRequestId: change.changeRequestId,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    status,
    // scope cr fields
    projectProposedChanges: changeRequest.scopeChangeRequest?.wbsProposedChanges?.projectProposedChanges
      ? projectProposedChangesTransformer(changeRequest.scopeChangeRequest?.wbsProposedChanges)
      : undefined,
    workPackageProposedChanges: changeRequest.scopeChangeRequest?.wbsProposedChanges?.workPackageProposedChanges
      ? workPackageProposedChangesTransformer(changeRequest.scopeChangeRequest?.wbsProposedChanges)
      : undefined,
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
    originalProjectData: changeRequest.scopeChangeRequest?.wbsOriginalData?.projectProposedChanges
      ? projectProposedChangesTransformer(changeRequest.scopeChangeRequest?.wbsOriginalData)
      : undefined,
    originalWorkPackageData: changeRequest.scopeChangeRequest?.wbsOriginalData?.workPackageProposedChanges
      ? workPackageProposedChangesTransformer(changeRequest.scopeChangeRequest?.wbsOriginalData)
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
    confirmDone: changeRequest.stageGateChangeRequest?.confirmDone ?? undefined,
    requestedReviewers: changeRequest.requestedReviewers ?? []
  };
};

export default changeRequestTransformer;
