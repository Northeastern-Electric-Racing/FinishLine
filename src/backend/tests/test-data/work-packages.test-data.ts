import { Prisma } from '@prisma/client';
import workPackageQueryArgs from '../../src/prisma-query-args/work-packages.query-args';
import { batman } from './users.test-data';
import { WorkPackage, WbsElementStatus, TimelineStatus, WorkPackageTemplate } from 'shared';
import { prismaWbsElement1 } from './wbs-element.test-data';
import { prismaProject1 } from './projects.test-data';

export const prismaWorkPackage1: Prisma.Work_PackageGetPayload<typeof workPackageQueryArgs> = {
  workPackageId: 1,
  wbsElementId: 65,
  projectId: 1,
  orderInProject: 1,
  startDate: new Date('10/10/2022'),
  duration: 10,
  wbsElement: {
    ...prismaWbsElement1,
    lead: batman,
    manager: batman,
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
  manager: undefined,
  lead: undefined,
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

export const WorkPackageTemplate1: WorkPackageTemplate = {
  workPackageTemplateId: 'id1',
  workPackageName: 'Work Package 1',
  templateName: 'Template 1',
  templateNotes: 'This is a new work package template',
  blockedBy: [],
  expectedActivities: [],
  deliverables: [],
  stage: undefined,
  duration: undefined,
  dateCreated: new Date('03/25/2024'),
  userCreated: batman,
  userCreatedId: batman.userId,
  dateDeleted: undefined,
  userDeleted: undefined,
  userDeletedId: undefined
};
