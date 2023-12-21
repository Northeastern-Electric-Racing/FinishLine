import { WBS_Element_Status as PrismaWBSElementStatus, WBS_Element as PrismaWbsElement } from '@prisma/client';

export const prismaWbsElement1: PrismaWbsElement = {
  wbsElementId: 1,
  status: PrismaWBSElementStatus.ACTIVE,
  carNumber: 1,
  projectNumber: 2,
  workPackageNumber: 0,
  dateCreated: new Date(),
  dateDeleted: null,
  name: 'car',
  deletedByUserId: null,
  projectLeadId: 4,
  projectManagerId: 5
};

export const prismaWbsElement2: PrismaWbsElement = {
  wbsElementId: 1,
  status: PrismaWBSElementStatus.ACTIVE,
  carNumber: 1,
  projectNumber: 2,
  workPackageNumber: 2,
  dateCreated: new Date(),
  dateDeleted: null,
  name: 'car',
  deletedByUserId: null,
  projectLeadId: 4,
  projectManagerId: 5
};
