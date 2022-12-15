import { WBS_Element_Status } from '@prisma/client';

export const project1 = {
  projectId: 2,
  wbsElementId: 3,
  budget: 3,
  summary: 'ajsjdfk',
  rules: ['a'],
  googleDriveFolderLink: 'https://drive.google.com/drive/folders/1',
  slideDeckLink: 'https://docs.google.com/presentation/d/1',
  bomLink: 'https://docs.google.com/spreadsheets/d/1',
  taskListLink: 'https://docs.google.com/spreadsheets/d/1',
  teamId: '1',
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
};

export const wbsElement1 = {
  wbsElementId: 1,
  status: WBS_Element_Status.ACTIVE,
  carNumber: 1,
  projectNumber: 2,
  workPackageNumber: 0,
  dateCreated: new Date(),
  dateDeleted: null,
  name: 'car',
  deletedByUserId: null,
  projectLeadId: 4,
  projectManagerId: 5,
  project: project1
};
