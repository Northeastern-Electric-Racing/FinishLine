import { Work_Package as PrismaWorkPackage } from '@prisma/client';
import { WorkPackage, WbsElementStatus, TimelineStatus } from 'shared';

export const prismaWorkPackage1: PrismaWorkPackage = {
  workPackageId: 1,
  wbsElementId: 65,
  projectId: 1,
  orderInProject: 1,
  startDate: new Date('10/10/2022'),
  duration: 10,
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
  dependencies: [],
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
  endDate: new Date('10/20/2022')
};
