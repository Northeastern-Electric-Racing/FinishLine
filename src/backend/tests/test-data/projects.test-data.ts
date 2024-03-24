import {
  Assembly,
  Material as PrismaMaterial,
  Material_Type as PrismaMaterialType,
  Prisma,
  WBS_Element_Status as PrismaWBSElementStatus,
  Project,
  Manufacturer as PrismaManufacturer,
  Unit
} from '@prisma/client';
import { Project as SharedProject, WbsElementStatus, LinkType, Manufacturer, Material, MaterialStatus } from 'shared';
import projectQueryArgs from '../../src/prisma-query-args/projects.query-args';
import { prismaTeam1 } from './teams.test-data';
import { batman, superman } from './users.test-data';
import { Decimal } from 'decimal.js';

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
    links: [],
    materials: [],
    assemblies: [
      {
        assemblyId: '1',
        name: 'a1',
        pdmFileName: 'file.txt',
        dateCreated: new Date('10/18/2022'),
        userCreatedId: batman.userId,
        userCreated: batman,
        userDeletedId: null,
        userDeleted: null,
        materials: [],
        wbsElementId: 65,
        dateDeleted: null
      }
    ]
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
        links: [],
        materials: [],
        assemblies: []
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
  teams: [],
  materials: [],
  assemblies: []
};

export const prismaLinkType1: LinkType = {
  name: 'Confluence',
  dateCreated: new Date('01-21-2024'),
  creator: batman,
  required: true,
  iconName: 'ConfluenceIcon'
};

export const prismaLinkType2: LinkType = {
  name: 'YouTube',
  dateCreated: new Date('01-21-2024'),
  creator: batman,
  required: true,
  iconName: 'YouTubeIcon'
};

export const prismaAssembly1: Assembly = {
  name: 'New Assembly',
  pdmFileName: 'file.txt',
  dateCreated: new Date('10-19-2023'),
  userCreatedId: batman.userId,
  wbsElementId: sharedProject1.id,
  dateDeleted: null,
  userDeletedId: null,
  assemblyId: '1'
};

export const prismaMaterialType: PrismaMaterialType = {
  name: 'name',
  dateCreated: new Date('10-18-2023'),
  userCreatedId: 1,
  dateDeleted: null
};

export const prismaUnit: Unit = {
  name: 'FT'
};

export const prismaMaterial: PrismaMaterial = {
  materialId: 'id',
  assemblyId: 'assemblyId',
  name: 'name',
  wbsElementId: 1,
  dateDeleted: null,
  userDeletedId: null,
  dateCreated: new Date('10-18-2023'),
  userCreatedId: 1,
  pdmFileName: 'file',
  status: 'ORDERED',
  notes: 'none',
  materialTypeName: 'type',
  manufacturerName: 'manufacturer',
  manufacturerPartNumber: 'partNum',
  price: 800,
  subtotal: 400,
  quantity: new Decimal(6),
  unitName: 'FT',
  linkUrl: 'https://www.google.com'
};

export const material1: Material = {
  materialId: '2',
  name: 'wood',
  wbsElementId: 1,
  dateCreated: new Date('2023-02-20'),
  userCreatedId: 3,
  userCreated: batman,
  status: MaterialStatus.Ordered,
  materialTypeName: 'logs',
  materialType: {
    name: 'material',
    dateCreated: new Date('2022-12-22'),
    userCreatedId: 4
  },
  manufacturerName: 'Amazon',
  manufacturer: {
    name: 'Big Company',
    dateCreated: new Date('2024-01-05'),
    userCreatedId: 6
  },
  manufacturerPartNumber: '11223',
  quantity: new Decimal(8),
  price: 20,
  subtotal: 2000,
  linkUrl: 'https://example.com',
  notes: 'IDK'
};

export const prismaManufacturer1: PrismaManufacturer = {
  name: 'PrismaManufacturer1',
  dateCreated: new Date('10-1-2023'),
  userCreatedId: 1
};

export const prismaManufacturer2: PrismaManufacturer = {
  name: 'name',
  dateCreated: new Date('10-18-2023'),
  userCreatedId: 1
};

export const manufacturer1: Manufacturer = {
  name: 'Manufacturer1',
  dateCreated: new Date('02-19-2023'),
  userCreatedId: 1,
  userCreated: batman,
  materials: []
};

export const manufacturer2: Manufacturer = {
  name: 'Manufacturer2',
  dateCreated: new Date('02-19-2023'),
  userCreatedId: 1,
  userCreated: batman,
  materials: [material1]
};

export const manufacturer3: Manufacturer = {
  name: 'Amazon',
  dateCreated: new Date('03-13-2024'),
  userCreatedId: 2,
  userCreated: superman,
  materials: [material1]
};

export const toolMaterial: PrismaMaterialType = {
  name: 'NERSoftwareTools',
  dateCreated: new Date(),
  userCreatedId: batman.userId,
  dateDeleted: null
};

export const prismaMaterial2: PrismaMaterial = {
  materialId: 'id',
  assemblyId: 'assemblyId',
  name: 'name2',
  wbsElementId: 1,
  dateDeleted: null,
  userDeletedId: null,
  dateCreated: new Date('10-18-2023'),
  userCreatedId: 1,
  pdmFileName: 'file2',
  status: 'ORDERED',
  notes: 'random notes',
  materialTypeName: 'type',
  manufacturerName: 'manufacturer',
  manufacturerPartNumber: 'partNum',
  price: 1000,
  subtotal: 500,
  quantity: new Decimal(8),
  unitName: 'FT',
  linkUrl: 'https://www.google.com'
};

export const prismaMaterial1: PrismaMaterial = {
  materialId: '1',
  assemblyId: '1',
  dateCreated: new Date('2023-11-07'),
  linkUrl: 'https://example.com',
  manufacturerName: 'Manufacturer1',
  manufacturerPartNumber: '1',
  materialTypeName: 'NERSoftwareTools',
  name: prismaManufacturer1.name,
  notes: 'Sample notes',
  pdmFileName: 'pdmname',
  price: 10,
  quantity: new Decimal(89),
  status: 'ORDERED',
  subtotal: 1,
  unitName: 'Unit',
  userCreatedId: batman.userId,
  wbsElementId: sharedProject1.id,
  dateDeleted: null,
  userDeletedId: null
};

export const mockLinkType1: LinkType = {
  name: 'Doc1',
  dateCreated: new Date('2024-01-23'),
  creator: batman,
  iconName: 'file',
  required: true
};
export const transformedMockLinkType1 = {
  name: 'Doc1',
  dateCreated: new Date('2024-01-23'),
  creator: batman,
  iconName: 'Doc2',
  required: true
};
