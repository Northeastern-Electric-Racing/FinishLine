import {
  Change_Request as PrismaChangeRequest,
  Proposed_Solution as PrismaProposedSolution,
  Scope_CR as PrismaScopeCR,
  Description_Bullet as PrismaDescriptionBullet,
  CR_Type as PrismaCRType
} from '@prisma/client';
import { ChangeRequest as SharedChangeRequest, ChangeRequestStatus, ChangeRequestType } from 'shared';
import { sharedBatman } from './users.test-data';

export const prismaChangeRequest1: PrismaChangeRequest = {
  crId: 1,
  submitterId: 1,
  wbsElementId: 65,
  type: PrismaCRType.DEFINITION_CHANGE,
  dateSubmitted: new Date('11/24/2020'),
  dateReviewed: new Date('11/25/2020'),
  accepted: null,
  reviewerId: null,
  reviewNotes: null,
  dateDeleted: null,
  deletedByUserId: null,
  wbsProposedChangesId: null
};

export const prismaProposedSolution1: PrismaProposedSolution = {
  proposedSolutionId: '1',
  description: 'Change Color from Orange to Black',
  timelineImpact: 10,
  budgetImpact: 1000,
  scopeImpact: 'huge',
  changeRequestId: 1,
  createdByUserId: 3,
  dateCreated: new Date('10/16/2022'),
  approved: false
};

export const prismaScopeChangeRequest1: PrismaScopeCR = {
  scopeCrId: 1,
  changeRequestId: 2,
  what: 'redesign whip',
  scopeImpact: 'huge',
  timelineImpact: 10,
  budgetImpact: 1000
};

export const whipExpectedActivites: PrismaDescriptionBullet = {
  descriptionId: 1,
  dateAdded: new Date('10/10/2022'),
  userCheckedId: 1,
  dateTimeChecked: new Date('10/10/2022'),
  dateDeleted: null,
  projectIdGoals: null,
  projectIdFeatures: null,
  projectIdOtherConstraints: null,
  workPackageIdDeliverables: null,
  detail: 'redesign whip',
  workPackageIdExpectedActivities: 1,
  projectProposedChangesGoalsId: null,
  projectProposedChangesFeaturesId: null,
  projectProposedChangesOtherConstraintsId: null,
  wpProposedChangesExpectedActivitiesId: null,
  wpProposedChangesDeliverablesId: null
};

export const whipDeliverables: PrismaDescriptionBullet = {
  descriptionId: 2,
  dateAdded: new Date('10/10/2022'),
  userCheckedId: 1,
  dateTimeChecked: new Date('10/10/2022'),
  detail: 'Gotta Finish',
  workPackageIdDeliverables: 1,
  projectIdGoals: null,
  projectIdFeatures: null,
  projectIdOtherConstraints: null,
  workPackageIdExpectedActivities: null,
  dateDeleted: null,
  projectProposedChangesGoalsId: null,
  projectProposedChangesFeaturesId: null,
  projectProposedChangesOtherConstraintsId: null,
  wpProposedChangesExpectedActivitiesId: null,
  wpProposedChangesDeliverablesId: null
};

export const sharedChangeRequest: SharedChangeRequest = {
  crId: 1,
  wbsNum: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 3
  },
  wbsName: 'whip',
  submitter: sharedBatman,
  dateSubmitted: new Date('12-25-2000'),
  type: ChangeRequestType.Redefinition,
  status: ChangeRequestStatus.Open,
  requestedReviewers: []
};
