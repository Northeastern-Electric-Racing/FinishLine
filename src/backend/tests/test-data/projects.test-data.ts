import { Prisma, WBS_Element_Status } from '@prisma/client';
import { prismaWbsElement1 } from './wbs-element.test-data';
import { Project as PrismaProject } from '@prisma/client';
import { WBS_Element as PrismaWBSElement } from '@prisma/client';
import { projectQueryArgs } from '../../src/prisma-query-args/projects.query-args';
import { batman } from './users.test-data';
import { prismaTeam1 } from './teams.test-data';
import { prismaRisk1, prismaRisk2 } from './risks.test-data';
// WHEN IT SHOWS 'PRISMAPROJECT & { .... }' DOES THAT MEAN I CAN JUST PUT A VARIABLE OF TYPE PRISMAPROJECT IN OR DO I HAVE TO WRITE OUT ALL THE FIELDS OF PRISMAPROJECT?

export const prismaProject1: PrismaProject = {
  projectId: 1,
  wbsElementId: 3,
  budget: 3,
  summary: 'ajsjdfk',
  googleDriveFolderLink: 'https://drive.google.com/drive/folders/1',
  slideDeckLink: 'https://docs.google.com/presentation/d/1',
  bomLink: 'https://docs.google.com/spreadsheets/d/1',
  taskListLink: 'https://docs.google.com/spreadsheets/d/1',
  rules: ['a'],
  teamId: '1'
};

export const project1: Prisma.ProjectGetPayload<typeof projectQueryArgs> = {
  ...prismaProject1,
  /*projectId: 1,
  wbsElementId: 3,
  budget: 3,
  summary: 'ajsjdfk',
  rules: ['a'],
  googleDriveFolderLink: 'https://drive.google.com/drive/folders/1',
  slideDeckLink: 'https://docs.google.com/presentation/d/1',
  bomLink: 'https://docs.google.com/spreadsheets/d/1',
  taskListLink: 'https://docs.google.com/spreadsheets/d/1',
  teamId: '1',*/
  wbsElement: {
    ...prismaWbsElement1,
    projectLead: batman,
    projectManager: batman,
    changes: []
    // wbsElementId: 100,
    // dateCreated: new Date('06/23/99'),
    // dateDeleted: new Date('06/26/99'),
    // carNumber: 3,
    // projectNumber: 4,
    // workPackageNumber: 1,
    // name: 'Project 1',
    // status: WBS_Element_Status.ACTIVE,
    // projectLeadId: 1,
    // projectManagerId: 1,
    // deletedByUserId: 2,
    // projectLead: batman,
    // projectManager: batman,
    // changes: []
  },
  goals: [],
  features: [],
  otherConstraints: [],
  team: prismaTeam1,
  risks: [
    {
      ...prismaRisk1,
      deletedBy: batman,
      project: {
        ...prismaProject1,
        wbsElement: prismaWbsElement1
      },
      createdBy: batman,
      resolvedBy: batman
    }
  ],
  // WHY ARE WE LEAVING RISKS EMPTY - DON'T WE WANT TO FILL IN THIS ARRAY WITH THE RISKS WE ALREADY HAVE?
  workPackages: [
    {
      wbsElement: {
        ...prismaWbsElement1,
        projectLead: batman,
        projectManager: batman,
        changes: []
        /*wbsElementId: 100,
        dateCreated: new Date('06/23/99'),
        dateDeleted: new Date('06/26/99'),
        carNumber: 3,
        projectNumber: 4,
        workPackageNumber: 1,
        name: 'Project 1',
        status: WBS_Element_Status.ACTIVE,
        projectLeadId: 1,
        projectManagerId: 1,
        deletedByUserId: 2,
        projectLead: batman,
        projectManager: batman,
        changes: []*/
      },
      dependencies: [],
      expectedActivities: [],
      deliverables: [],
      workPackageId: 5,
      wbsElementId: 4,
      projectId: 1,
      orderInProject: 2,
      startDate: new Date('06/26/99'),
      duration: 3
    }
  ]
};

/*export const prismaWbsElement1: PrismaWBSElement = {
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
  projectManagerId: 5
};*/

const newProjectPayload = {
  userId: 1,
  crId: 2,
  name: 'build a car',
  carNumber: 3,
  summary: 'we are building a car'
};

const editProjectPayload = {
  ...newProjectPayload,
  budget: 100,
  projectId: 4,
  rules: ['a', 'b', 'c'],
  goals: [{ id: 1, detail: 'd' }],
  features: [{ id: 1, detail: 'e' }],
  otherConstraints: [{ id: 1, detail: 'f' }],
  wbsElementStatus: 'ACTIVE',
  googleDriveFolderLink: 'a',
  slideDeckLink: 'g',
  bomLink: 'h',
  taskListLink: 'i',
  projectLead: 5,
  projectManager: 6
};
