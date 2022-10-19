import { Risk } from '@prisma/client';

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
