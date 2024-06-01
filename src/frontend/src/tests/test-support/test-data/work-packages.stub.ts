/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsElementStatus, WorkPackage, WorkPackageStage } from 'shared';
import {
  exampleAdminUser,
  exampleAppAdminUser,
  exampleGuestUser,
  exampleLeadershipUser,
  exampleLeadUser,
  exampleManagerUser
} from './users.stub';
import {
  exampleWbsProject1,
  exampleWbsProject2,
  exampleWbsWorkPackage1,
  exampleWbsWorkPackage2,
  exampleWbsWorkPackage3,
  exampleWbsWorkPackage4,
  exampleWbsWorkPackage5
} from './wbs-numbers.stub';

export const exampleResearchWorkPackage: WorkPackage = {
  id: '1',
  wbsElementId: '1',
  wbsNum: exampleWbsWorkPackage1,
  dateCreated: new Date('11/15/20'),
  name: 'Bodywork Concept of Design',
  status: WbsElementStatus.Active,
  lead: exampleAdminUser,
  manager: exampleLeadershipUser,
  orderInProject: 1,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/22/21'),
  duration: 3,
  blockedBy: [],
  links: [],
  descriptionBullets: [],
  changes: [
    {
      changeId: '1',
      changeRequestId: '33',
      wbsNum: exampleWbsWorkPackage3,
      implementer: exampleGuestUser,
      detail: 'Increased funding by $500.',
      dateImplemented: new Date('11/15/2003')
    }
  ],
  projectName: 'project1',
  stage: WorkPackageStage.Research,
  materials: [],
  assemblies: [],
  blocking: []
};

export const exampleDesignWorkPackage: WorkPackage = {
  id: '2',
  wbsElementId: '2',
  wbsNum: exampleWbsWorkPackage2,
  dateCreated: new Date('10/02/20'),
  name: 'Adhesive Shear Strength Test',
  status: WbsElementStatus.Inactive,
  lead: exampleLeadUser,
  manager: exampleLeadershipUser,
  orderInProject: 2,
  startDate: new Date('01/22/21'),
  endDate: new Date('02/26/21'),
  duration: 5,
  blockedBy: [exampleWbsWorkPackage1],
  links: [],
  descriptionBullets: [],
  changes: [
    {
      changeId: '2',
      changeRequestId: '1',
      wbsNum: exampleWbsWorkPackage3,
      implementer: exampleAppAdminUser,
      detail: 'Decreased duration from 10 weeks to 7 weeks.',
      dateImplemented: new Date('03/24/21')
    },

    {
      changeId: '13',
      changeRequestId: '54',
      wbsNum: exampleWbsWorkPackage1,
      implementer: exampleLeadUser,
      detail: 'Added "jet fuel burns hot" bullet.',
      dateImplemented: new Date('03/24/21')
    }
  ],
  projectName: 'project2',
  stage: WorkPackageStage.Design,
  materials: [],
  assemblies: [],
  blocking: []
};

export const exampleManufacturingWorkPackage: WorkPackage = {
  id: '3',
  wbsElementId: '3',
  wbsNum: exampleWbsWorkPackage3,
  dateCreated: new Date('09/27/20'),
  name: 'Manufacture Wiring Harness',
  status: WbsElementStatus.Complete,
  lead: exampleLeadershipUser,
  manager: exampleManagerUser,
  orderInProject: 3,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/15/21'),
  duration: 2,
  blockedBy: [exampleWbsProject1, exampleWbsProject2],
  links: [],
  descriptionBullets: [],
  changes: [
    {
      changeId: '7',
      changeRequestId: '14',
      wbsNum: exampleWbsWorkPackage1,
      implementer: exampleAdminUser,
      detail: 'Increased budget from $10 to $200.',
      dateImplemented: new Date('03/24/21')
    }
  ],
  projectName: 'project3',
  stage: WorkPackageStage.Manufacturing,
  materials: [],
  assemblies: [],
  blocking: []
};

export const exampleInstallWorkPackage: WorkPackage = {
  id: '4',
  wbsElementId: '4',
  wbsNum: exampleWbsWorkPackage4,
  dateCreated: new Date('2022-02-20'),
  name: 'Install Wiring Harness',
  status: WbsElementStatus.Complete,
  lead: exampleLeadershipUser,
  manager: exampleManagerUser,
  orderInProject: 4,
  startDate: new Date('2022-02-20'),
  endDate: new Date('2022-02-27'),
  duration: 1,
  blockedBy: [exampleWbsWorkPackage3],
  links: [],
  descriptionBullets: [],
  changes: [
    {
      changeId: '8',
      changeRequestId: '15',
      wbsNum: exampleWbsWorkPackage1,
      implementer: exampleAdminUser,
      detail: 'New Work Package Created',
      dateImplemented: new Date('2022-02-20')
    }
  ],
  projectName: 'project3',
  stage: WorkPackageStage.Install,
  materials: [],
  assemblies: [],
  blocking: []
};

export const exampleWorkPackage5: WorkPackage = {
  id: '5',
  wbsElementId: '5',
  wbsNum: exampleWbsWorkPackage5,
  dateCreated: new Date('2022-02-20'),
  name: 'Party In Celebration',
  status: WbsElementStatus.Complete,
  lead: exampleLeadershipUser,
  manager: exampleManagerUser,
  orderInProject: 5,
  startDate: new Date('2022-02-21'),
  endDate: new Date('2022-02-28'),
  duration: 1,
  blockedBy: [],
  links: [],
  descriptionBullets: [],
  changes: [
    {
      changeId: '9',
      changeRequestId: '16',
      wbsNum: exampleWbsWorkPackage1,
      implementer: exampleAdminUser,
      detail: 'New Work Package Created',
      dateImplemented: new Date('2022-02-21')
    }
  ],
  projectName: 'project3',
  materials: [],
  assemblies: [],
  blocking: []
};

export const exampleAllWorkPackages: WorkPackage[] = [
  exampleResearchWorkPackage,
  exampleDesignWorkPackage,
  exampleManufacturingWorkPackage
];
