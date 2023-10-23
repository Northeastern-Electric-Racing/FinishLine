import {
  Material_Type as PrismaMaterialType,
  Prisma,
  WBS_Element_Status as PrismaWBSElementStatus,
  Project,
  Manufacturer,
  Assembly
} from '@prisma/client';
import { Project as SharedProject, WbsElementStatus } from 'shared';
import projectQueryArgs from '../../src/prisma-query-args/projects.query-args';
import { prismaTeam1 } from './teams.test-data';
import { batman, superman } from './users.test-data';

export const prismaProject2: Project = {
  projectId: 2,
  wbsElementId: 3,
  budget: 3,
  summary: 'ajsjdfk',
  rules: ['a']
};

export const prismaProject1: Prisma.ProjectGetPayload<typeof projectQueryArgs> = {
  projectId: 2,
  wbsElementId: 3,
  budget: 3,
  summary: 'ajsjdfk',
  rules: ['a'],
  wbsElement: {
    wbsElementId: 65,
    dateCreated: new Date('10/18/2022'),
    carNumber: 1,
    projectNumber: 1,
    workPackageNumber: 0,
    name: 'Project 1',
    status: PrismaWBSElementStatus.ACTIVE,
    projectLeadId: batman.userId,
    projectLead: batman,
    projectManagerId: superman.userId,
    projectManager: superman,
    dateDeleted: null,
    deletedByUserId: null,
    changes: [],
    tasks: [],
    links: []
  },
  workPackages: [
    {
      workPackageId: 2,
      wbsElementId: 7,
      projectId: 6,
      orderInProject: 0,
      startDate: new Date('2020-07-14'),
      duration: 4,
      wbsElement: {
        wbsElementId: 66,
        dateCreated: new Date('01/25/2023'),
        carNumber: 1,
        projectNumber: 1,
        workPackageNumber: 1,
        name: 'Work Package 1',
        status: PrismaWBSElementStatus.ACTIVE,
        dateDeleted: null,
        deletedByUserId: null,
        projectLeadId: null,
        projectLead: null,
        projectManagerId: null,
        projectManager: null,
        changes: [],
        links: []
      },
      blockedBy: [],
      expectedActivities: [],
      deliverables: [],
      stage: null
    }
  ],
  goals: [],
  features: [],
  otherConstraints: [],
  teams: [prismaTeam1],
  favoritedBy: []
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
  links: [],
  rules: ['rule 1', 'rule 2'],
  duration: 0,
  goals: [],
  features: [],
  otherConstraints: [],
  workPackages: [],
  tasks: [],
  teams: []
};

export const prismaAssembly1: Assembly = {
  name: 'New Assembly',
  pdmFileName: 'file.txt',
  dateCreated: new Date('10-19-2023'),
  userCreatedId: batman.userId,
  wbsElementId: 66,
  dateDeleted: null,
  userDeletedId: null,
  assemblyId: '1'

export const prismaManufacturer1: Manufacturer = {
  name: 'Manufacturer1',
  dateCreated: new Date('10-1-2023'),
  creatorId: 1
};

export const toolMaterial: PrismaMaterialType = {
  name: 'NERSoftwareTools',
  dateCreated: new Date(),
  creatorId: batman.userId
};
