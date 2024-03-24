import { Blocked_By_Info, Prisma, Work_Package_Template } from '@prisma/client';
import workPackageQueryArgs from '../../src/prisma-query-args/work-packages.query-args';
import { batman } from './users.test-data';
import { WorkPackage, WbsElementStatus, TimelineStatus, WorkPackageStage } from 'shared';
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

export const mockBlockedByInfo1: Blocked_By_Info = {
  blockedByInfoId: "efwfwef",
  stage: "DESIGN",
  name: "Blocked By Info 1",
  workPackageTemplateId: "wopejfoi"
}

export const mockWorkPackageTemplate1: Work_Package_Template = {
  workPackageTemplateId: "wopejfoi",
  templateName: "template 1",
  templateNotes: "template 1 notes",
  workPackageName: "Work Package 1",
  stage: null,
  duration: 2,
  expectedActivities: ["hi"],
  deliverables: ["hi"],
  dateCreated: new Date(),
  userCreatedId: 324,
  dateDeleted: new Date(),
  userDeletedId: 324
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
