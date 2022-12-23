import { WBS_Element as PrismaWBSElement, WBS_Element_Status as PrismaWBSElementStatus } from '@prisma/client';

export const prismaWbsElement1: PrismaWBSElement = {
  wbsElementId: 65,
  dateCreated: new Date('10/18/2022'),
  carNumber: 1,
  projectNumber: 1,
  workPackageNumber: 1,
  name: 'redesign whip',
  status: PrismaWBSElementStatus.ACTIVE,
  projectLeadId: 1,
  projectManagerId: 2
};
