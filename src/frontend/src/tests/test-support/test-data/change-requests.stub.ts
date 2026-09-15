/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  ActivationChangeRequest,
  ChangeRequest,
  ChangeRequestStatus,
  ChangeRequestType,
  RoleEnum,
  StageGateChangeRequest,
  StandardChangeRequest
} from 'shared';
import { exampleAdminUser, exampleAppAdminUser, exampleLeadUser, exampleManagerUser } from './users.stub';
import { exampleWbsProject1, exampleWbsWorkPackage1 } from './wbs-numbers.stub';

export const exampleStandardChangeRequest: StandardChangeRequest = {
  crId: '37',
  identifier: 37,
  wbsNum: exampleWbsProject1,
  wbsName: 'Example Work Package 1',
  submitter: exampleAdminUser,
  dateSubmitted: new Date('02/25/21'),
  dateReviewed: new Date('03/01/21'),
  reviewer: exampleAppAdminUser,
  accepted: true,
  reviewNotes: 'Adjust description, increase budget to 200, and add 3 weeks',
  dateImplemented: new Date('03/04/21'),
  status: ChangeRequestStatus.Implemented,
  type: ChangeRequestType.Standard,
  why: 'Spacers are needed to prevent the jet fuel from melting the I beams',
  requestedReviewers: []
};

export const exampleActivationChangeRequest: ActivationChangeRequest = {
  crId: '69',
  identifier: 69,
  wbsNum: exampleWbsWorkPackage1,
  wbsName: 'Example Work Package 1',
  submitter: exampleAdminUser,
  dateSubmitted: new Date('02/25/21'),
  type: ChangeRequestType.Activation,
  lead: exampleLeadUser,
  manager: exampleManagerUser,
  startDate: new Date('03/01/21'),
  confirmDetails: true,
  status: ChangeRequestStatus.Accepted,
  requestedReviewers: []
};

export const exampleStageGateChangeRequest: StageGateChangeRequest = {
  crId: '93',
  identifier: 93,
  wbsNum: exampleWbsWorkPackage1,
  wbsName: 'Example Work Package 1',
  submitter: exampleAdminUser,
  dateSubmitted: new Date('02/25/21'),
  type: ChangeRequestType.StageGate,
  leftoverBudget: 26,
  confirmDone: true,
  status: ChangeRequestStatus.Implemented,
  requestedReviewers: []
};

export const exampleStandardImplementedChangeRequest: StandardChangeRequest = {
  crId: '37',
  identifier: 37,
  wbsNum: exampleWbsWorkPackage1,
  wbsName: 'Example Work Package 1',
  submitter: exampleAdminUser,
  dateSubmitted: new Date('02/25/21'),
  type: ChangeRequestType.Standard,
  dateReviewed: new Date('03/01/21'),
  accepted: true,
  reviewNotes: 'Adjust description, increase budget to 200, and add 3 weeks',
  dateImplemented: new Date('03/04/21'),
  status: ChangeRequestStatus.Implemented,
  why: 'Spacers are needed to prevent the jet fuel from melting the I beams. Original estimate did not account for spacers. No availability in Richards.',
  implementedChanges: [
    {
      changeRequestIdentifier: 1,
      changeId: '1',
      changeRequestId: '37',
      wbsNum: {
        carNumber: 1,
        projectNumber: 23,
        workPackageNumber: 3
      },
      implementer: {
        userId: '22',
        firstName: 'Joe',
        lastName: 'Schmoe',
        email: 'j.schmoe@northeastern.edu',
        role: RoleEnum.LEADERSHIP
      },
      detail: 'Adjust description',
      dateImplemented: new Date('02/25/21')
    },
    {
      changeRequestIdentifier: 1,
      changeId: '1',
      changeRequestId: '37',
      wbsNum: {
        carNumber: 1,
        projectNumber: 23,
        workPackageNumber: 4
      },
      implementer: {
        userId: '22',
        firstName: 'Joe',
        lastName: 'Schmoe',
        email: 'j.schmoe@northeastern.edu',
        role: RoleEnum.LEADERSHIP
      },
      detail: 'Increase budget to 200',
      dateImplemented: new Date('02/25/21')
    },
    {
      changeRequestIdentifier: 1,
      changeId: '1',
      changeRequestId: '37',
      wbsNum: {
        carNumber: 1,
        projectNumber: 23,
        workPackageNumber: 5
      },
      implementer: {
        userId: '22',
        firstName: 'Joe',
        lastName: 'Schmoe',
        email: 'j.schmoe@northeastern.edu',
        role: RoleEnum.LEADERSHIP
      },
      detail: 'Add 3 weeks',
      dateImplemented: new Date('02/25/21')
    }
  ],
  requestedReviewers: []
};

export const exampleAllChangeRequests: ChangeRequest[] = [
  exampleStandardChangeRequest,
  exampleActivationChangeRequest,
  exampleStageGateChangeRequest
];
