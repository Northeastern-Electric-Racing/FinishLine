import { Prisma } from '@prisma/client';
import {
  ChangeRequest,
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
  ChangeRequestStatus
} from 'shared';
import { wbsNumOf } from '../utils/utils.js';
import { calculateChangeRequestStatus, convertCRScopeWhyType } from '../utils/change-requests.utils.js';
import proposedSolutionTransformer from './proposed-solutions.transformer.js';
import { getDateImplemented } from '../utils/change-requests.utils.js';
import { userTransformer } from './user.transformer.js';
import { descBulletConverter } from '../utils/description-bullets.utils.js';
import teamTransformer from './teams.transformer.js';
import {
  WbsProposedChangeQueryArgs,
  WorkPackageProposedChangesQueryArgs
} from '../prisma-query-args/scope-change-requests.query-args.js';
import { HttpException } from '../utils/errors.utils.js';
import {
  ChangeRequestGuestQueryArgs,
  ChangeRequestManyQueryArgs,
  ChangeRequestWithProjectAndWorkPackageQueryArgs
} from '../prisma-query-args/change-requests.query-args.js';
import { accountCodeTransformer, otherProductReasonTransformer } from './reimbursement-requests.transformer.js';
import { GuestChangeRequest } from '../../../shared/src/types/change-request-types.js';

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

export const guestChangeRequestTransformer = (
  changeRequest: Prisma.Change_RequestGetPayload<ChangeRequestGuestQueryArgs>
): GuestChangeRequest => {
  const status = changeRequest.changes.length
    ? ChangeRequestStatus.Implemented
    : changeRequest.accepted && changeRequest.dateReviewed
      ? ChangeRequestStatus.Accepted
      : changeRequest.dateReviewed
        ? ChangeRequestStatus.Denied
        : ChangeRequestStatus.Open;

  const wbsName = changeRequest.wbsElement
    ? !isWorkPackageWbs(changeRequest.wbsElement)
      ? changeRequest.wbsElement?.name
      : `${changeRequest.wbsElement?.workPackage?.project.wbsElement.name} - ${changeRequest.wbsElement?.name}`
    : undefined;

  return {
    crId: changeRequest.crId,
    submitter: userTransformer(changeRequest.submitter),
    identifier: changeRequest.identifier,
    type: changeRequest.type,
    status,
    teamTypeNames: changeRequest.wbsElement
      ? isWorkPackageWbs(changeRequest.wbsElement)
        ? (changeRequest.wbsElement.workPackage?.project?.teams
            .map((team) => team.teamType?.name)
            .filter((name) => name !== undefined) ?? [])
        : (changeRequest.wbsElement.project?.teams.map((team) => team.teamType?.name).filter((name) => name !== undefined) ??
          [])
      : [],
    accepted: changeRequest.accepted ?? undefined,
    reviewer: changeRequest.reviewer ? userTransformer(changeRequest.reviewer) : undefined,
    wbsNum: changeRequest.wbsElement ? wbsNumOf(changeRequest.wbsElement) : undefined,
    wbsName
  };
};
