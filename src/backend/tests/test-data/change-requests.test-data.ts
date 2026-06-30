import { Change_Request as PrismaChangeRequest } from '@prisma/client';
import { ChangeRequest as SharedChangeRequest, ChangeRequestStatus, ChangeRequestType } from 'shared';
import { sharedBatman } from './users.test-data.js';

export const prismaChangeRequest1: PrismaChangeRequest = {
  crId: '1',
  identifier: 1,
  organizationId: '1',
  submitterId: '1',
  wbsElementId: '65',
  categoryId: null,
  accountCodeId: null,
  type: ChangeRequestType.Budget,
  why: null,
  wbsProposedChangesId: null,
  dateSubmitted: new Date('11/24/2020'),
  dateReviewed: new Date('11/25/2020'),
  accepted: null,
  reviewerId: null,
  reviewNotes: null,
  dateDeleted: null,
  deletedByUserId: null
};

export const sharedChangeRequest: SharedChangeRequest = {
  crId: '1',
  wbsNum: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 3
  },
  wbsName: 'whip',
  submitter: sharedBatman,
  dateSubmitted: new Date('12-25-2000'),
  type: ChangeRequestType.Leadership,
  status: ChangeRequestStatus.Open,
  requestedReviewers: [],
  identifier: 1
};
