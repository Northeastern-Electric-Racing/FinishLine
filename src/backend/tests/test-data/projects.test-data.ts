import { Prisma, WBS_Element_Status } from '@prisma/client';
import { prismaWbsElement1 } from './wbs-element.test-data';
import { Project as PrismaProject } from '@prisma/client';
import { WBS_Element as PrismaWBSElement } from '@prisma/client';
import { projectQueryArgs } from '../../src/prisma-query-args/projects.query-args';
export const project1: Prisma.ProjectGetPayload<typeof projectQueryArgs> = {
  projectId: 2,
  wbsElementId: 3,
  budget: 3,
  summary: 'ajsjdfk',
  rules: ['a'],
  googleDriveFolderLink: 'https://drive.google.com/drive/folders/1',
  slideDeckLink: 'https://docs.google.com/presentation/d/1',
  bomLink: 'https://docs.google.com/spreadsheets/d/1',
  taskListLink: 'https://docs.google.com/spreadsheets/d/1',
  teamId: '1'
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
