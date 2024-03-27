import { Blocked_By_Info, Prisma, Work_Package_Template } from '@prisma/client';
import workPackageQueryArgs from '../../src/prisma-query-args/work-packages.query-args';
import { batman, thomasEmrax } from './users.test-data';
import { WorkPackage, WbsElementStatus, TimelineStatus, WorkPackageStage, WorkPackageTemplate, BlockedByInfo } from 'shared';
import { prismaWbsElement1 } from './wbs-element.test-data';
import { prismaProject1 } from './projects.test-data';
import { mock } from 'node:test';

export const prismaWorkPackage1: Prisma.Work_PackageGetPayload<typeof workPackageQueryArgs> = {
  workPackageId: 1,
  wbsElementId: 65,
  projectId: 1,
  orderInProject: 1,
  startDate: new Date('10/10/2022'),
  duration: 10,
  wbsElement: {
    ...prismaWbsElement1,
    projectLead: batman,
    projectManager: batman,
    changes: [],
    tasks: [],
    blocking: []
  },
  project: prismaProject1,
  blockedBy: [],
  deliverables: [],
  expectedActivities: [],
  stage: null
};

export const mockBlockedByInfo1: BlockedByInfo = {
  blockedByInfoId: "efwfwef",
  stage: WorkPackageStage.Design,
  name: "Blocked By Info 1",
}

export const BlockedByInfo1: Blocked_By_Info = {
  blockedByInfoId: "efwfwef",
  stage: WorkPackageStage.Design,
  name: "Blocked By Info 1",
  workPackageTemplateId: "id1"
}

export const WorkPackageTemplate1: WorkPackageTemplate = {
  workPackageTemplateId: 'id1',
  templateName: 'Template 1',
  templateNotes: 'This is a new work package template',
  dateCreated: new Date('03/25/2024'),
  blockedBy:[mockBlockedByInfo1],
  dateDeleted: undefined,
  userCreated: thomasEmrax,
  deliverables: [],
  duration: undefined,
  expectedActivities: [],
  stage: undefined,
  userCreatedId: 1,
  userDeleted: undefined,
  userDeletedId: undefined,
  workPackageName: ''
};

export const sharedWorkPackage: WorkPackage = {
  id: 1,
  dateCreated: new Date('10/18/2022'),
  name: 'Work Package 1',
  orderInProject: 1,
  progress: 0,
  startDate: new Date('10/10/2022'),
  duration: 10,
  expectedActivities: [],
  deliverables: [],
  blockedBy: [],
  links: [],
  projectManager: undefined,
  projectLead: undefined,
  status: WbsElementStatus.Active,
  wbsNum: {
    carNumber: 1,
    projectNumber: 1,
    workPackageNumber: 1
  },
  changes: [],
  expectedProgress: 0,
  projectName: 'Project 1',
  timelineStatus: TimelineStatus.OnTrack,
  endDate: new Date('10/20/2022'),
  materials: [],
  assemblies: []
};
