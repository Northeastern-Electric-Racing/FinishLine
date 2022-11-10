import { Risk } from '@prisma/client';
import { WBS_Element_Status } from '@prisma/client';

export const editRiskTrue: Risk = {
  id: '56c939bf-d95a-4e43-b0bc-0f0581db9cfb',
  projectId: 1,
  detail: 'This one might be a bit too expensive',
  isResolved: true,
  dateDeleted: null,
  dateCreated: new Date('2022-10-19T22:50:45.580Z'),
  createdByUserId: 1,
  resolvedByUserId: null,
  resolvedAt: null,
  deletedByUserId: null
};

export const editRiskFalse: Risk = {
  id: '56c939bf-d95a-4e43-b0bc-0f0581db9cfb',
  projectId: 1,
  detail: 'This one might be a bit too expensive',
  isResolved: false,
  dateDeleted: null,
  dateCreated: new Date('2022-10-19T22:50:45.580Z'),
  createdByUserId: 1,
  resolvedByUserId: null,
  resolvedAt: null,
  deletedByUserId: null
};

export const editRiskTruePayload = {
  userId: 1,
  id: '56c939bf-d95a-4e43-b0bc-0f0581db9cfb',
  detail: 'This one might be a bit too expensive',
  resolved: true
};

export const editRiskFalsePayload = {
  userId: 1,
  id: '56c939bf-d95a-4e43-b0bc-0f0581db9cfb',
  detail: 'This one might be a bit too expensive',
  resolved: false
};

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
