import { Prisma } from '@prisma/client';
import {
  ChangeRequest,
  ChangeRequestStatus,
  ChangeRequestTableRow,
  StandardChangeRequest,
  ActivationChangeRequest,
  StageGateChangeRequest,
  ProjectProposedChanges,
  WbsElementStatus,
  WorkPackageProposedChanges,
  WorkPackageStage,
  BudgetChangeRequest,
  isWorkPackageWbs,
  LeadershipChangeRequest,
  FullChangeRequest,
  FullStandardChangeRequest,
  FullActivationChangeRequest,
  FullStageGateChangeRequest,
  FullBudgetChangeRequest,
  FullLeadershipChangeRequest
} from 'shared';
import { wbsNumOf } from '../utils/utils.js';
import { calculateChangeRequestStatus, convertCRScopeWhyType } from '../utils/change-requests.utils.js';
import proposedSolutionTransformer from './proposed-solutions.transformer.js';
import { getDateImplemented } from '../utils/change-requests.utils.js';
import { userTransformer, userPreviewTransformer } from './user.transformer.js';
import { descBulletConverter } from '../utils/description-bullets.utils.js';
import teamTransformer from './teams.transformer.js';
import {
  WbsProposedChangeQueryArgs,
  WorkPackageProposedChangesQueryArgs
} from '../prisma-query-args/scope-change-requests.query-args.js';
import { HttpException } from '../utils/errors.utils.js';
import {
  ChangeRequestManyQueryArgs,
  ChangeRequestTableRowQueryArgs,
  ChangeRequestWithProjectAndWorkPackageQueryArgs
} from '../prisma-query-args/change-requests.query-args.js';
import { accountCodeTransformer, otherProductReasonTransformer } from './reimbursement-requests.transformer.js';

const projectProposedChangesTransformer = (
  wbsProposedChanges: Prisma.Wbs_Proposed_ChangesGetPayload<WbsProposedChangeQueryArgs>
): ProjectProposedChanges => {
  const { projectProposedChanges } = wbsProposedChanges;
  if (!projectProposedChanges) throw new HttpException(404, 'Project Proposed Changes not found');

  return {
    id: wbsProposedChanges.wbsProposedChangesId,
    name: wbsProposedChanges.name,
    status: wbsProposedChanges.status as WbsElementStatus,
    links: wbsProposedChanges.links,
    lead: wbsProposedChanges.lead ? userTransformer(wbsProposedChanges.lead) : undefined,
    manager: wbsProposedChanges.manager ? userTransformer(wbsProposedChanges.manager) : undefined,
    summary: projectProposedChanges.summary,
    budget: projectProposedChanges.budget,
    descriptionBullets: wbsProposedChanges.proposedDescriptionBulletChanges.map(descBulletConverter),
    teams: projectProposedChanges.teams.map(teamTransformer),
    carNumber: projectProposedChanges.car?.wbsElement.carNumber ?? undefined,
    workPackageProposedChanges: projectProposedChanges.workPackageProposedChanges.map(workPackageProposedChangesTransformer)
  };
};

const workPackageProposedChangesTransformer = (
  workPackageProposedChanges: Prisma.Work_Package_Proposed_ChangesGetPayload<WorkPackageProposedChangesQueryArgs>
): WorkPackageProposedChanges => {
  return {
    id: workPackageProposedChanges.wbsProposedChangesId,
    name: workPackageProposedChanges.wbsProposedChanges.name,
    status: workPackageProposedChanges.wbsProposedChanges.status as WbsElementStatus,
    links: workPackageProposedChanges.wbsProposedChanges.links,
    lead: workPackageProposedChanges.wbsProposedChanges.lead
      ? userTransformer(workPackageProposedChanges.wbsProposedChanges.lead)
      : undefined,
    manager: workPackageProposedChanges.wbsProposedChanges.manager
      ? userTransformer(workPackageProposedChanges.wbsProposedChanges.manager)
      : undefined,
    startDate: workPackageProposedChanges.startDate,
    duration: workPackageProposedChanges.duration,
    blockedBy: workPackageProposedChanges.blockedBy.map(wbsNumOf),
    descriptionBullets:
      workPackageProposedChanges.wbsProposedChanges.proposedDescriptionBulletChanges.map(descBulletConverter),
    stage: (workPackageProposedChanges.stage as WorkPackageStage) || undefined
  };
};

export const changeRequestTableRowTransformer = (
  changeRequest: Prisma.Change_RequestGetPayload<ChangeRequestTableRowQueryArgs>
): ChangeRequestTableRow => {
  const changes = changeRequest.changes;
  const hasChanges = changes.length > 0;

  // Inline status calculation (avoids dependency on ChangeRequestManyQueryArgs type)
  let status: ChangeRequestStatus;
  if (hasChanges) {
    status = ChangeRequestStatus.Implemented;
  } else if (changeRequest.accepted && changeRequest.dateReviewed) {
    status = ChangeRequestStatus.Accepted;
  } else if (changeRequest.dateReviewed) {
    status = ChangeRequestStatus.Denied;
  } else {
    status = ChangeRequestStatus.Open;
  }

  // Earliest change date
  const dateImplemented = hasChanges
    ? changes.reduce(
        (res: Date | undefined, change) =>
          !res || change.dateImplemented.valueOf() < res.valueOf() ? change.dateImplemented : res,
        undefined
      )
    : undefined;

  const wbsElement = changeRequest.wbsElement;

  return {
    crId: changeRequest.crId,
    identifier: changeRequest.identifier,
    type: changeRequest.type,
    dateSubmitted: changeRequest.dateSubmitted,
    dateReviewed: changeRequest.dateReviewed ?? undefined,
    accepted: changeRequest.accepted ?? undefined,
    reviewNotes: changeRequest.reviewNotes ?? undefined,
    dateImplemented,
    status,
    wbsNum: wbsElement
      ? {
          carNumber: wbsElement.carNumber,
          projectNumber: wbsElement.projectNumber,
          workPackageNumber: wbsElement.workPackageNumber
        }
      : undefined,
    wbsName: wbsElement?.name ?? undefined,
    submitter: userPreviewTransformer(changeRequest.submitter),
    reviewer: changeRequest.reviewer ? userPreviewTransformer(changeRequest.reviewer) : undefined,
    category: changeRequest.category ? { name: changeRequest.category.name } : undefined,
    accountCode: changeRequest.accountCode
      ? {
          accountCodeId: changeRequest.accountCode.accountCodeId,
          code: changeRequest.accountCode.code,
          name: changeRequest.accountCode.name
        }
      : undefined,
    implementedChangesCount: changes.length,
    requestedReviewers: changeRequest.requestedReviewers.map(userPreviewTransformer),
    // Type-specific fields
    lead: changeRequest.leadershipChangeRequest?.lead
      ? userPreviewTransformer(changeRequest.leadershipChangeRequest.lead)
      : changeRequest.activationChangeRequest?.lead
        ? userPreviewTransformer(changeRequest.activationChangeRequest.lead)
        : undefined,
    manager: changeRequest.leadershipChangeRequest?.manager
      ? userPreviewTransformer(changeRequest.leadershipChangeRequest.manager)
      : changeRequest.activationChangeRequest?.manager
        ? userPreviewTransformer(changeRequest.activationChangeRequest.manager)
        : undefined,
    startDate: changeRequest.activationChangeRequest?.startDate ?? undefined,
    confirmDetails: changeRequest.activationChangeRequest?.confirmDetails ?? undefined,
    leftoverBudget: changeRequest.stageGateChangeRequest?.leftoverBudget ?? undefined,
    confirmDone: changeRequest.stageGateChangeRequest?.confirmDone ?? undefined,
    proposedBudget: changeRequest.budgetChangeRequest?.proposedBudget ?? undefined
  };
};

export const changeRequestManyTransformer = (
  changeRequest: Prisma.Change_RequestGetPayload<ChangeRequestManyQueryArgs>
):
  | ChangeRequest
  | StandardChangeRequest
  | ActivationChangeRequest
  | StageGateChangeRequest
  | BudgetChangeRequest
  | LeadershipChangeRequest => {
  const status = calculateChangeRequestStatus(changeRequest);

  return {
    // all cr fields
    crId: changeRequest.crId,
    identifier: changeRequest.identifier,
    wbsNum: changeRequest.wbsElement ? wbsNumOf(changeRequest.wbsElement) : undefined,
    wbsName: changeRequest.wbsElement?.name ?? undefined,
    category: changeRequest.category ? otherProductReasonTransformer(changeRequest.category) : undefined,
    accountCode: changeRequest.accountCode ? accountCodeTransformer(changeRequest.accountCode) : undefined,
    submitter: userTransformer(changeRequest.submitter),
    dateSubmitted: changeRequest.dateSubmitted,
    type: changeRequest.type,
    reviewer: changeRequest.reviewer ? userTransformer(changeRequest.reviewer) : undefined,
    dateReviewed: changeRequest.dateReviewed ?? undefined,
    accepted: changeRequest.accepted ?? undefined,
    reviewNotes: changeRequest.reviewNotes ?? undefined,
    dateImplemented: getDateImplemented(changeRequest),
    implementedChanges: [],
    status,
    // scope cr fields
    projectProposedChanges: undefined,
    workPackageProposedChanges: undefined,
    what: undefined,
    why: undefined,
    scopeImpact: undefined,
    budgetImpact: undefined,
    timelineImpact: undefined,
    proposedSolutions: undefined,
    originalProjectData: undefined,
    originalWorkPackageData: undefined,
    // activation + leadership cr fields
    lead: changeRequest.leadershipChangeRequest?.lead
      ? userTransformer(changeRequest.leadershipChangeRequest.lead)
      : changeRequest.activationChangeRequest?.lead
        ? userTransformer(changeRequest.activationChangeRequest.lead)
        : undefined,
    manager: changeRequest.leadershipChangeRequest?.manager
      ? userTransformer(changeRequest.leadershipChangeRequest.manager)
      : changeRequest.activationChangeRequest?.manager
        ? userTransformer(changeRequest.activationChangeRequest.manager)
        : undefined,
    startDate: changeRequest.activationChangeRequest?.startDate ?? undefined,
    confirmDetails: changeRequest.activationChangeRequest?.confirmDetails ?? undefined,
    // stage gate cr fields
    leftoverBudget: changeRequest.stageGateChangeRequest?.leftoverBudget ?? undefined,
    confirmDone: changeRequest.stageGateChangeRequest?.confirmDone ?? undefined,
    requestedReviewers: changeRequest.requestedReviewers.map(userTransformer) ?? [],
    //budget cr fields
    proposedBudget: changeRequest.budgetChangeRequest?.proposedBudget ?? undefined
  };
};

const changeRequestTransformer = (
  changeRequest: Prisma.Change_RequestGetPayload<ChangeRequestWithProjectAndWorkPackageQueryArgs>
):
  | ChangeRequest
  | StandardChangeRequest
  | ActivationChangeRequest
  | StageGateChangeRequest
  | BudgetChangeRequest
  | LeadershipChangeRequest => {
  const status = calculateChangeRequestStatus(changeRequest);

  const wbsName = changeRequest.wbsElement
    ? !isWorkPackageWbs(changeRequest.wbsElement)
      ? changeRequest.wbsElement?.name
      : `${changeRequest.wbsElement?.workPackage?.project.wbsElement.name} - ${changeRequest.wbsElement?.name}`
    : undefined;

  return {
    // all cr fields
    crId: changeRequest.crId,
    identifier: changeRequest.identifier,
    wbsNum: changeRequest.wbsElement ? wbsNumOf(changeRequest.wbsElement) : undefined,
    wbsName,
    category: changeRequest.category ? otherProductReasonTransformer(changeRequest.category) : undefined,
    accountCode: changeRequest.accountCode ? accountCodeTransformer(changeRequest.accountCode) : undefined,
    submitter: userTransformer(changeRequest.submitter),
    dateSubmitted: changeRequest.dateSubmitted,
    type: changeRequest.type,
    reviewer: changeRequest.reviewer ? userTransformer(changeRequest.reviewer) : undefined,
    dateReviewed: changeRequest.dateReviewed ?? undefined,
    accepted: changeRequest.accepted ?? undefined,
    reviewNotes: changeRequest.reviewNotes ?? undefined,
    dateImplemented: getDateImplemented(changeRequest),
    implementedChanges: changeRequest.changes.map((change) => ({
      wbsNum: change.wbsElement ? wbsNumOf(change.wbsElement) : undefined,
      category: change.category ? otherProductReasonTransformer(change.category) : undefined,
      accountCode: change.accountCode ? accountCodeTransformer(change.accountCode) : undefined,
      changeId: change.changeId,
      changeRequestIdentifier: changeRequest.identifier,
      changeRequestId: change.changeRequestId,
      implementer: userTransformer(change.implementer),
      detail: change.detail,
      dateImplemented: change.dateImplemented
    })),
    status,
    // scope cr fields
    projectProposedChanges: changeRequest.scopeChangeRequest?.wbsProposedChanges?.projectProposedChanges
      ? projectProposedChangesTransformer(changeRequest.scopeChangeRequest.wbsProposedChanges)
      : undefined,
    workPackageProposedChanges: changeRequest.scopeChangeRequest?.wbsProposedChanges?.workPackageProposedChanges
      ? workPackageProposedChangesTransformer(changeRequest.scopeChangeRequest.wbsProposedChanges.workPackageProposedChanges)
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
      ? (changeRequest.scopeChangeRequest?.proposedSolutions.map(proposedSolutionTransformer) ?? [])
      : undefined,
    originalProjectData: changeRequest.scopeChangeRequest?.wbsOriginalData?.projectProposedChanges
      ? projectProposedChangesTransformer(changeRequest.scopeChangeRequest.wbsOriginalData)
      : undefined,
    originalWorkPackageData: changeRequest.scopeChangeRequest?.wbsOriginalData?.workPackageProposedChanges
      ? workPackageProposedChangesTransformer(changeRequest.scopeChangeRequest.wbsOriginalData.workPackageProposedChanges)
      : undefined,
    // activation + leadership cr fields
    lead: changeRequest.leadershipChangeRequest?.lead
      ? userTransformer(changeRequest.leadershipChangeRequest.lead)
      : changeRequest.activationChangeRequest?.lead
        ? userTransformer(changeRequest.activationChangeRequest.lead)
        : undefined,
    manager: changeRequest.leadershipChangeRequest?.manager
      ? userTransformer(changeRequest.leadershipChangeRequest.manager)
      : changeRequest.activationChangeRequest?.manager
        ? userTransformer(changeRequest.activationChangeRequest.manager)
        : undefined,
    startDate: changeRequest.activationChangeRequest?.startDate ?? undefined,
    confirmDetails: changeRequest.activationChangeRequest?.confirmDetails ?? undefined,
    // stage gate cr fields
    leftoverBudget: changeRequest.stageGateChangeRequest?.leftoverBudget ?? undefined,
    confirmDone: changeRequest.stageGateChangeRequest?.confirmDone ?? undefined,
    requestedReviewers: changeRequest.requestedReviewers.map(userTransformer) ?? [],
    //budget cr fields
    proposedBudget: changeRequest.budgetChangeRequest?.proposedBudget ?? undefined
  };
};

export default changeRequestTransformer;
