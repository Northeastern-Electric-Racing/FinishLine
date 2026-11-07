/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsElementStatus, WorkPackageDetail, WorkPackageStage } from 'shared';
import {
  exampleAdminUser,
  exampleAppAdminUser,
  exampleGuestUser,
  exampleLeadershipUser,
  exampleLeadUser,
  exampleManagerUser
} from './users.stub';
import {
  exampleWbsWorkPackage1,
  exampleWbsWorkPackage2,
  exampleWbsWorkPackage3,
  exampleWbsWorkPackage4,
  exampleWbsWorkPackage5
} from './wbs-numbers.stub';

// what GET /work-packages/:wbsNum returns: blockers come back named, and deleted bullets are already filtered out

export const exampleResearchWorkPackageDetail: WorkPackageDetail = {
  id: '1',
  wbsElementId: '1',
  projectId: '1',
  wbsNum: exampleWbsWorkPackage1,
  name: 'Bodywork Concept of Design',
  status: WbsElementStatus.Active,
  stage: WorkPackageStage.Research,
  lead: exampleAdminUser,
  manager: exampleLeadershipUser,
  orderInProject: 1,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/22/21'),
  duration: 3,
  projectName: 'project1',
  blockedBy: [],
  descriptionBullets: [],
  changes: [
    {
      changeId: '1',
      changeRequestId: '33',
      changeRequestIdentifier: 1,
      implementer: exampleGuestUser,
      detail: 'Increased funding by $500.',
      dateImplemented: new Date('11/15/2003')
    }
  ]
};

export const exampleDesignWorkPackageDetail: WorkPackageDetail = {
  id: '2',
  wbsElementId: '2',
  projectId: '1',
  wbsNum: exampleWbsWorkPackage2,
  name: 'Adhesive Shear Strength Test',
  status: WbsElementStatus.Inactive,
  stage: WorkPackageStage.Design,
  lead: exampleLeadUser,
  manager: exampleLeadershipUser,
  orderInProject: 2,
  startDate: new Date('01/22/21'),
  endDate: new Date('02/26/21'),
  duration: 5,
  projectName: 'project2',
  blockedBy: [{ wbsNum: exampleWbsWorkPackage1, name: 'Bodywork Concept of Design' }],
  descriptionBullets: [],
  changes: [
    {
      changeId: '2',
      changeRequestId: 'some id',
      changeRequestIdentifier: 1,
      implementer: exampleAppAdminUser,
      detail: 'Decreased duration from 10 weeks to 7 weeks.',
      dateImplemented: new Date('03/24/21')
    },
    {
      changeId: '13',
      changeRequestId: 'another id',
      changeRequestIdentifier: 54,
      implementer: exampleLeadUser,
      detail: 'Added "jet fuel burns hot" bullet.',
      dateImplemented: new Date('03/24/21')
    }
  ]
};

export const exampleManufacturingWorkPackageDetail: WorkPackageDetail = {
  id: '3',
  wbsElementId: '3',
  projectId: '1',
  wbsNum: exampleWbsWorkPackage3,
  name: 'Manufacture Wiring Harness',
  status: WbsElementStatus.Complete,
  stage: WorkPackageStage.Manufacturing,
  lead: exampleLeadershipUser,
  manager: exampleManagerUser,
  orderInProject: 3,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/15/21'),
  duration: 2,
  projectName: 'project3',
  blockedBy: [
    { wbsNum: exampleWbsWorkPackage1, name: 'Bodywork Concept of Design' },
    { wbsNum: exampleWbsWorkPackage2, name: 'Adhesive Shear Strength Test' }
  ],
  descriptionBullets: [],
  changes: [
    {
      changeId: '7',
      changeRequestId: '14',
      changeRequestIdentifier: 1,
      implementer: exampleAdminUser,
      detail: 'Increased budget from $10 to $200.',
      dateImplemented: new Date('03/24/21')
    }
  ]
};

export const exampleInstallWorkPackageDetail: WorkPackageDetail = {
  id: '4',
  wbsElementId: '4',
  projectId: '1',
  wbsNum: exampleWbsWorkPackage4,
  name: 'Install Wiring Harness',
  status: WbsElementStatus.Complete,
  stage: WorkPackageStage.Install,
  lead: exampleLeadershipUser,
  manager: exampleManagerUser,
  orderInProject: 4,
  startDate: new Date('2022-02-20'),
  endDate: new Date('2022-02-27'),
  duration: 1,
  projectName: 'project3',
  blockedBy: [{ wbsNum: exampleWbsWorkPackage3, name: 'Manufacture Wiring Harness' }],
  descriptionBullets: [],
  changes: [
    {
      changeId: '8',
      changeRequestId: '15',
      changeRequestIdentifier: 1,
      implementer: exampleAdminUser,
      detail: 'New Work Package Created',
      dateImplemented: new Date('2022-02-20')
    }
  ]
};

export const exampleWorkPackage5Detail: WorkPackageDetail = {
  id: '5',
  wbsElementId: '5',
  projectId: '1',
  wbsNum: exampleWbsWorkPackage5,
  name: 'Party In Celebration',
  status: WbsElementStatus.Complete,
  lead: exampleLeadershipUser,
  manager: exampleManagerUser,
  orderInProject: 5,
  startDate: new Date('2022-02-21'),
  endDate: new Date('2022-02-28'),
  duration: 1,
  projectName: 'project3',
  blockedBy: [],
  descriptionBullets: [],
  changes: [
    {
      changeId: '9',
      changeRequestId: '16',
      changeRequestIdentifier: 1,
      implementer: exampleAdminUser,
      detail: 'New Work Package Created',
      dateImplemented: new Date('2022-02-21')
    }
  ]
};
