import { WBS_Element_Status } from '@prisma/client';
import { Project as SharedProject, WbsElementStatus } from 'shared';
import { prismaWbsElement1 } from './wbs-element.test-data';

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
  wbsElement: prismaWbsElement1,
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
        workPackageNumber: 9,
        dateDeleted: null,
        deletedByUserId: null
      },
      dependencies: []
    }
  ]
};

export const sharedProject1: SharedProject = {
  id: 1,
  wbsNum: {
    carNumber: 1,
    projectNumber: 2,
    workPackageNumber: 0
  },
  dateCreated: new Date('12-25-2022'),
  name: 'name',
  status: WbsElementStatus.Active,
  changes: [],
  summary: 'summary',
  budget: 5,
  gDriveLink: 'gdrive',
  taskListLink: 'task',
  slideDeckLink: 'slide',
  bomLink: 'bom',
  rules: ['rule 1', 'rule 2'],
  duration: 0,
  goals: [],
  features: [],
  otherConstraints: [],
  workPackages: [],
  risks: []
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
