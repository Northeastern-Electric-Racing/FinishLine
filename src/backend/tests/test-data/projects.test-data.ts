import { WBS_Element_Status } from '@prisma/client';
import { batman } from './users.test-data';
import { CR_Type } from '@prisma/client';

export const someProject = {
  wbsElementId: 1,
  status: WBS_Element_Status.ACTIVE,
  carNumber: 1,
  projectNumber: 2,
  workPackageNumber: 0,
  dateCreated: new Date(),
  name: 'car',
  projectLeadId: 4,
  projectManagerId: 5,
  project: {
    projectId: 2,
    wbsElementId: 3,
    budget: 3,
    summary: 'ajsjdfk',
    rules: ['a'],
    workPackages: [
      {
        workPackageId: 2,
        wbsElementId: 7,
        projectId: 6,
        orderInProject: 0,
        startDate: new Date('2020-07-14'),
        progress: 5,
        duration: 4,
        wbsElement: {
          workPackageNumber: 9
        },
        dependencies: []
      }
    ]
  }
};

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

export const changeBatmobile = {
  crId: 1,
  submitterId: 1,
  wbsElementId: 65,
  type: CR_Type.DEFINITION_CHANGE,
  changes: [
    {
      changeRequestId: 1,
      implementerId: 1,
      wbsElementId: 65,
      detail: 'changed batmobile from white (yuck) to black'
    }
  ],
  dateSubmitted: new Date('11/24/2020'),
  dateReviewed: new Date('11/25/2020'),
  accepted: true,
  reviewerId: 1,
  reviewNotes: 'white sucks'
};