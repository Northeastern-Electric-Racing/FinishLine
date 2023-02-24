import { Prisma } from '@prisma/client';
import { prismaWbsElement1 } from './wbs-element.test-data';
import { Project as PrismaProject } from '@prisma/client';
import { projectQueryArgs } from '../../src/prisma-query-args/projects.query-args';
import { batman } from './users.test-data';
import { prismaTeam1 } from './teams.test-data';
import { prismaRisk1 } from './risks.test-data';
import { WBS_Element_Status } from '@prisma/client';
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
  wbsElement: {
    ...prismaWbsElement1,
    projectLead: batman,
    projectManager: batman,
    changes: []
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

export const sharedProject1 = {
  id: 1,
  wbsNum: 20,
  dateCreated: new Date('05/22/16'),
  name: 'name',
  status: WBS_Element_Status.ACTIVE,
  projectLead: batman,
  projectManager: '',
  changes: [],
  team: prismaTeam1,
  summary: 'ajsjdfk',
  budget: 3,
  gDriveLink: 'https://drive.google.com/drive/folders/1',
  taskListLink: 'https://docs.google.com/spreadsheets/d/1',
  slideDeckLink: 'https://docs.google.com/presentation/d/1',
  bomLink: 'https://docs.google.com/spreadsheets/d/1',
  rules: [],
  duration: 3,
  startDate: new Date('06/26/17'),
  endDate: new Date('06/27/17'),
  goals: [],
  features: [],
  otherConstraints: [],
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
  workPackages: [
    {
      wbsElement: {
        ...prismaWbsElement1,
        projectLead: batman,
        projectManager: batman,
        changes: []
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
