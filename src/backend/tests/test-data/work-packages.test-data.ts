import { batman } from './users.test-data';
import { WBS_Element_Status } from '@prisma/client';
import { project1, wbsElement1 } from './projects.test-data';

export const createWorkPackagePayload = {
  projectId: 1,
  workPackageId: 22,
  wbsElementId: 5,
  projectWbsNum: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  },
  name: 'Pack your bags',
  crId: 1,
  userId: batman.userId,
  startDate: '2022-09-18',
  duration: 5,
  dependencies: [
    {
      wbsElementId: 65,
      dateCreated: new Date('11/24/2021'),
      carNumber: 1,
      projectNumber: 1,
      workPackageNumber: 1,
      name: 'prereq',
      status: WBS_Element_Status.COMPLETE
    }
  ],
  expectedActivities: ['ayo'],
  deliverables: ['ajdhjakfjafja']
};

export const createWorkPackage = {
  workPackageId: 10,
  wbsElemendId: wbsElement1.wbsElementId,
  wbsElement: wbsElement1,
  projectId: project1.projectId,
  project: project1,
  orderInProject: 7,
  startDate: '2022-09-10',
  duration: 10,
  dependencies: [
    {
      wbsElementId: 65,
      dateCreated: new Date('11/24/2021'),
      carNumber: 1,
      projectNumber: 1,
      workPackageNumber: 1,
      name: 'prereq',
      status: WBS_Element_Status.COMPLETE
    }
  ],
  expectedActivities: ['ayo'],
  deliverables: ['nothing']
}