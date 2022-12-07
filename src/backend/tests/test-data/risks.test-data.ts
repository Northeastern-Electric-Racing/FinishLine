import { Risk, RoleEnum } from 'shared';

export const editRiskTrue = {
  id: 'id1',
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

export const editRiskFalse = {
  id: 'id1',
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

export const transformedRisk: Risk = {
  id: 'abc',
  project: {
    id: 1,
    name: 'project name',
    wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 3 }
  },
  detail: 'detail',
  isResolved: true,
  dateCreated: new Date('2022-12-25'),
  createdBy: {
    userId: 2,
    firstName: 'a',
    lastName: 'b',
    email: 'a@b.com',
    role: RoleEnum.ADMIN
  }
};
