import { batman } from './users.test-data';
import { WBS_Element_Status, Work_Package as PrismaWorkPackage } from '@prisma/client';

export const prismaWorkPackage1: PrismaWorkPackage = {
  workPackageId: 1,
  wbsElementId: 65,
  projectId: 1,
  orderInProject: 1,
  startDate: new Date('10/10/2022'),
  duration: 10
};
