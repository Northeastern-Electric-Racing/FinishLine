import { batman } from './users.test-data';
import { WBS_Element_Status } from '@prisma/client';

export const createWorkPackagePayload = {
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
