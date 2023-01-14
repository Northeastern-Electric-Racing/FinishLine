import { Prisma } from '@prisma/client';
import workPackageQueryArgs from '../../src/prisma-query-args/work-packages.query-args';
import { wbsElement1, project1 } from './projects.test-data';
import { batman } from './users.test-data';

export const prismaWorkPackage1: Prisma.Work_PackageGetPayload<typeof workPackageQueryArgs> = {
  workPackageId: 1,
  wbsElementId: 65,
  projectId: 1,
  orderInProject: 1,
  startDate: new Date('10/10/2022'),
  duration: 10,
  wbsElement: {
    ...wbsElement1,
    projectLead: batman,
    projectManager: batman,
    changes: []
  },
  project: project1,
  dependencies: [],
  deliverables: [],
  expectedActivities: []
};
