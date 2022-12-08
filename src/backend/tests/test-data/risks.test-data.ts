import { Risk as PrismaRisk } from '@prisma/client';
import { Risk as SharedRisk } from 'shared';
import { batman } from './users.test-data';

export const prismaRisk1: PrismaRisk = {
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

export const prismaRisk2: PrismaRisk = {
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

export const sharedRisk1: SharedRisk = {
  id: 'riskId',
  detail: 'detail',
  isResolved: true,
  dateCreated: new Date(),
  createdBy: batman,
  project: {
    id: 1,
    name: 'preview project',
    wbsNum: {
      carNumber: 1,
      projectNumber: 2,
      workPackageNumber: 3
    }
  }
};
