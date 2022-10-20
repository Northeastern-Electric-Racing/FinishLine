import { WBS_Element_Status } from '@prisma/client';

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
