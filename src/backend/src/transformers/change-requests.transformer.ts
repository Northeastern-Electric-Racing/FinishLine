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
import { descBulletConverter } from '../utils/description-bullets.utils';
import { linkTransformer } from './links.transformer';
import teamTransformer from './teams.transformer';
import { WbsProposedChangeQueryArgs } from '../prisma-query-args/scope-change-requests.query-args';
import { HttpException } from '../utils/errors.utils';
import { ChangeRequestQueryArgs } from '../prisma-query-args/change-requests.query-args';

const projectProposedChangesTransformer = (
  wbsProposedChanges: Prisma.Wbs_Proposed_ChangesGetPayload<WbsProposedChangeQueryArgs>
): ProjectProposedChanges => {
  const { projectProposedChanges } = wbsProposedChanges;
  if (!projectProposedChanges) throw new HttpException(404, 'Project Proposed Changes not found');

  return {
    id: wbsProposedChanges.wbsProposedChangesId,
    name: wbsProposedChanges.name,
    status: wbsProposedChanges.status as WbsElementStatus,
    links: wbsProposedChanges.links.map(linkTransformer),
    lead: wbsProposedChanges.lead ? userTransformer(wbsProposedChanges.lead) : undefined,
    manager: wbsProposedChanges.manager ? userTransformer(wbsProposedChanges.manager) : undefined,
    summary: projectProposedChanges.summary,
    budget: projectProposedChanges.budget,
    descriptionBullets: wbsProposedChanges.proposedDescriptionBulletChanges.map(descBulletConverter),
    teams: projectProposedChanges.teams.map(teamTransformer),
    carNumber: projectProposedChanges.car?.wbsElement.carNumber ?? undefined
  };
};

const workPackageProposedChangesTransformer = (
  wbsProposedChanges: Prisma.Wbs_Proposed_ChangesGetPayload<WbsProposedChangeQueryArgs>
): WorkPackageProposedChanges => {
  const { workPackageProposedChanges } = wbsProposedChanges;
  if (!workPackageProposedChanges) throw new HttpException(404, 'Work Package Proposed Changes not found');

  return {
    id: wbsProposedChanges.wbsProposedChangesId,
    name: wbsProposedChanges.name,
    status: wbsProposedChanges.status as WbsElementStatus,
    links: wbsProposedChanges.links.map(linkTransformer),
    lead: wbsProposedChanges.lead ? userTransformer(wbsProposedChanges.lead) : undefined,
    manager: wbsProposedChanges.manager ? userTransformer(wbsProposedChanges.manager) : undefined,
    startDate: workPackageProposedChanges.startDate,
    duration: workPackageProposedChanges.duration,
    blockedBy: workPackageProposedChanges.blockedBy.map(wbsNumOf),
    descriptionBullets: wbsProposedChanges.proposedDescriptionBulletChanges.map(descBulletConverter),
    stage: (workPackageProposedChanges.stage as WorkPackageStage) || undefined
  };
};

const changeRequestTransformer = (
  changeRequest: Prisma.Change_RequestGetPayload<ChangeRequestQueryArgs>
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
    // activation cr fields
    projectLead: changeRequest.activationChangeRequest?.lead
      ? userTransformer(changeRequest.activationChangeRequest.lead)
      : undefined,
    projectManager: changeRequest.activationChangeRequest?.manager
      ? userTransformer(changeRequest.activationChangeRequest.manager)
      : undefined,
    startDate: changeRequest.activationChangeRequest?.startDate ?? undefined,
    confirmDetails: changeRequest.activationChangeRequest?.confirmDetails ?? undefined,
    // stage gate cr fields
    leftoverBudget: changeRequest.stageGateChangeRequest?.leftoverBudget ?? undefined,
    confirmDone: changeRequest.stageGateChangeRequest?.confirmDone ?? undefined,
    requestedReviewers: changeRequest.requestedReviewers.map(userTransformer) ?? []
  };
};

export default changeRequestTransformer;
