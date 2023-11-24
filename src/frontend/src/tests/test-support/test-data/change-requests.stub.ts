/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  ActivationChangeRequest,
  ChangeRequest,
  ChangeRequestReason,
  ChangeRequestStatus,
  ChangeRequestType,
  RoleEnum,
  StageGateChangeRequest,
  StandardChangeRequest
} from 'shared';
import { exampleAdminUser, exampleAppAdminUser, exampleProjectLeadUser, exampleProjectManagerUser } from './users.stub';
import { exampleWbsProject1, exampleWbsWorkPackage1 } from './wbs-numbers.stub';

export const exampleStandardChangeRequest: StandardChangeRequest = {
  crId: 37,
  wbsNum: exampleWbsProject1,
  wbsName: 'Example Work Package 1',
  submitter: exampleAdminUser,
  dateSubmitted: new Date('02/25/21'),
  type: ChangeRequestType.Issue,
  dateReviewed: new Date('03/01/21'),
  reviewer: exampleAppAdminUser,
  accepted: true,
  reviewNotes: 'Adjust description, increase budget to 200, and add 3 weeks',
  dateImplemented: new Date('03/04/21'),
  status: ChangeRequestStatus.Implemented,
  what: 'Spacers are needed to prevent the jet fuel from melting the I beams',
  why: [
    {
      type: ChangeRequestReason.Estimation,
      explain: 'Original estimate did not account for spacers'
    },
    {
      type: ChangeRequestReason.Manufacturing,
      explain: 'No availibilitiy in Richards'
    },
    {
      type: ChangeRequestReason.Other,
      explain: "Matt won't shut up"
    },
    {
      type: ChangeRequestReason.OtherProject,
      explain: '2.2.0'
    },
    {
      type: ChangeRequestReason.Rules,
      explain: 'Discovered rule EV 5.2.6'
    },
    {
      type: ChangeRequestReason.School,
      explain: 'All team members had 5 midterms each'
    }
  ],
  scopeImpact: 'Design and machine titanium spacers',
  budgetImpact: 75,
  timelineImpact: 2,
  proposedSolutions: [],
  requestedReviewers: []
};

export const exampleActivationChangeRequest: ActivationChangeRequest = {
  crId: 69,
  wbsNum: exampleWbsWorkPackage1,
  wbsName: 'Example Work Package 1',
  submitter: exampleAdminUser,
  dateSubmitted: new Date('02/25/21'),
  type: ChangeRequestType.Activation,
  projectLead: exampleProjectLeadUser,
  projectManager: exampleProjectManagerUser,
  startDate: new Date('03/01/21'),
  confirmDetails: true,
  status: ChangeRequestStatus.Accepted,
  requestedReviewers: []
};

export const exampleStageGateChangeRequest: StageGateChangeRequest = {
  crId: 93,
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
  crId: 37,
  wbsNum: exampleWbsWorkPackage1,
  wbsName: 'Example Work Package 1',
  submitter: exampleAdminUser,
  dateSubmitted: new Date('02/25/21'),
  type: ChangeRequestType.Issue,
  dateReviewed: new Date('03/01/21'),
  accepted: true,
  reviewNotes: 'Adjust description, increase budget to 200, and add 3 weeks',
  dateImplemented: new Date('03/04/21'),
  status: ChangeRequestStatus.Implemented,
  what: 'Spacers are needed to prevent the jet fuel from melting the I beams',
  why: [
    {
      type: ChangeRequestReason.Estimation,
      explain: 'Original estimate did not account for spacers'
    },
    {
      type: ChangeRequestReason.Manufacturing,
      explain: 'No availibilitiy in Richards'
    },
    {
      type: ChangeRequestReason.Other,
      explain: "Matt won't shut up"
    },
    {
      type: ChangeRequestReason.OtherProject,
      explain: '2.2.0'
    },
    {
      type: ChangeRequestReason.Rules,
      explain: 'Discovered rule EV 5.2.6'
    },
    {
      type: ChangeRequestReason.School,
      explain: 'All team members had 5 midterms each'
    }
  ],
  scopeImpact: 'Design and machine titanium spacers',
  budgetImpact: 75,
  timelineImpact: 2,
  implementedChanges: [
    {
      changeId: 1,
      changeRequestId: 37,
      wbsNum: {
        carNumber: 1,
        projectNumber: 23,
        workPackageNumber: 3
      },
      implementer: {
        userId: 22,
        firstName: 'Joe',
        lastName: 'Schmoe',
        email: 'j.schmoe@northeastern.edu',
        emailId: null,
        role: RoleEnum.LEADERSHIP
      },
      detail: 'Adjust description',
      dateImplemented: new Date('02/25/21')
    },
    {
      changeId: 1,
      changeRequestId: 37,
      wbsNum: {
        carNumber: 1,
        projectNumber: 23,
        workPackageNumber: 4
      },
      implementer: {
        userId: 22,
        firstName: 'Joe',
        lastName: 'Schmoe',
        email: 'j.schmoe@northeastern.edu',
        emailId: null,
        role: RoleEnum.LEADERSHIP
      },
      detail: 'Increase budget to 200',
      dateImplemented: new Date('02/25/21')
    },
    {
      changeId: 1,
      changeRequestId: 37,
      wbsNum: {
        carNumber: 1,
        projectNumber: 23,
        workPackageNumber: 5
      },
      implementer: {
        userId: 22,
        firstName: 'Joe',
        lastName: 'Schmoe',
        email: 'j.schmoe@northeastern.edu',
        emailId: null,
        role: RoleEnum.LEADERSHIP
      },
      detail: 'Add 3 weeks',
      dateImplemented: new Date('02/25/21')
    }
  ],
  proposedSolutions: [],
  requestedReviewers: []
};

export const exampleAllChangeRequests: ChangeRequest[] = [
  exampleStandardChangeRequest,
  exampleActivationChangeRequest,
  exampleStageGateChangeRequest
];
