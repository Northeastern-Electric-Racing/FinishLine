/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProjectDetailWorkPackage, WbsElementStatus, WorkPackageStage } from 'shared';
import { exampleAdminUser, exampleLeadershipUser, exampleLeadUser, exampleManagerUser } from './users.stub';
import {
  exampleWbsWorkPackage1,
  exampleWbsWorkPackage2,
  exampleWbsWorkPackage3,
  exampleWbsWorkPackage4,
  exampleWbsWorkPackage5
} from './wbs-numbers.stub';

// work packages as GET /projects/:wbsNum returns them: blockers come back named, with a preview of their bullets

export const exampleResearchWorkPackage: ProjectDetailWorkPackage = {
  id: '1',
  wbsElementId: '1',
  projectId: '1',
  wbsNum: exampleWbsWorkPackage1,
  name: 'Bodywork Concept of Design',
  status: WbsElementStatus.Active,
  lead: exampleAdminUser,
  manager: exampleLeadershipUser,
  orderInProject: 1,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/22/21'),
  duration: 3,
  projectName: 'project1',
  stage: WorkPackageStage.Research,
  blockedBy: [],
  blocking: [exampleWbsWorkPackage2],
  descriptionBullets: [],
  events: []
};

export const exampleDesignWorkPackage: ProjectDetailWorkPackage = {
  id: '2',
  wbsElementId: '2',
  projectId: '1',
  wbsNum: exampleWbsWorkPackage2,
  name: 'Adhesive Shear Strength Test',
  status: WbsElementStatus.Inactive,
  lead: exampleLeadUser,
  manager: exampleLeadershipUser,
  orderInProject: 2,
  startDate: new Date('01/22/21'),
  endDate: new Date('02/26/21'),
  duration: 5,
  projectName: 'project2',
  stage: WorkPackageStage.Design,
  blockedBy: [{ wbsNum: exampleWbsWorkPackage1, name: 'Bodywork Concept of Design' }],
  blocking: [],
  descriptionBullets: [],
  events: []
};

export const exampleManufacturingWorkPackage: ProjectDetailWorkPackage = {
  id: '3',
  wbsElementId: '3',
  projectId: '1',
  wbsNum: exampleWbsWorkPackage3,
  name: 'Manufacture Wiring Harness',
  status: WbsElementStatus.Complete,
  lead: exampleLeadershipUser,
  manager: exampleManagerUser,
  orderInProject: 3,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/15/21'),
  duration: 2,
  projectName: 'project3',
  stage: WorkPackageStage.Manufacturing,
  blockedBy: [],
  blocking: [exampleWbsWorkPackage4],
  descriptionBullets: [],
  events: []
};

export const exampleInstallWorkPackage: ProjectDetailWorkPackage = {
  id: '4',
  wbsElementId: '4',
  projectId: '1',
  wbsNum: exampleWbsWorkPackage4,
  name: 'Install Wiring Harness',
  status: WbsElementStatus.Complete,
  lead: exampleLeadershipUser,
  manager: exampleManagerUser,
  orderInProject: 4,
  startDate: new Date('2022-02-20'),
  endDate: new Date('2022-02-27'),
  duration: 1,
  projectName: 'project3',
  stage: WorkPackageStage.Install,
  blockedBy: [{ wbsNum: exampleWbsWorkPackage3, name: 'Manufacture Wiring Harness' }],
  blocking: [],
  descriptionBullets: [],
  events: []
};

export const exampleWorkPackage5: ProjectDetailWorkPackage = {
  id: '5',
  wbsElementId: '5',
  projectId: '1',
  wbsNum: exampleWbsWorkPackage5,
  name: 'Party In Celebration',
  status: WbsElementStatus.Complete,
  lead: exampleAdminUser,
  manager: exampleManagerUser,
  orderInProject: 5,
  startDate: new Date('2022-02-21'),
  endDate: new Date('2022-02-28'),
  duration: 1,
  projectName: 'project3',
  blockedBy: [],
  blocking: [],
  descriptionBullets: [],
  events: []
};
