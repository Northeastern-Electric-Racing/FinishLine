/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link, LinkType, Project, WbsElementStatus } from 'shared';
import { exampleTask1 } from './tasks.stub';
import { exampleTeam } from './teams.stub';
import { exampleAdminUser, exampleLeadershipUser, exampleProjectLeadUser, exampleProjectManagerUser } from './users.stub';
import { exampleWbsProject1, exampleWbsProject2 } from './wbs-numbers.stub';
import { exampleResearchWorkPackage, exampleDesignWorkPackage, exampleManufacturingWorkPackage } from './work-packages.stub';

const exampleConfluenceLinkType: LinkType = {
  name: 'Confluence',
  dateCreated: new Date('05/26/21'),
  creator: exampleAdminUser,
  iconName: 'confluence',
  required: true
};

const exampleBomLinkType: LinkType = {
  name: 'BOM',
  dateCreated: new Date('05/26/21'),
  creator: exampleAdminUser,
  iconName: 'bom',
  required: true
};

const exampleGDriveLinkType: LinkType = {
  name: 'Google Drive',
  dateCreated: new Date('05/26/21'),
  creator: exampleAdminUser,
  iconName: 'google-drive',
  required: true
};

const exampleLinks: Link[] = [
  {
    linkId: '1',
    linkType: exampleConfluenceLinkType,
    url: 'https://www.google.com',
    dateCreated: new Date('05/26/21'),
    creator: exampleAdminUser
  },
  {
    linkId: '2',
    linkType: exampleBomLinkType,
    url: 'https://www.google.com',
    dateCreated: new Date('05/26/21'),
    creator: exampleAdminUser
  },
  {
    linkId: '3',
    linkType: exampleGDriveLinkType,
    url: 'https://www.google.com',
    dateCreated: new Date('05/26/21'),
    creator: exampleAdminUser
  }
];
export const exampleProject1: Project = {
  id: 4,
  wbsNum: { carNumber: 1, projectNumber: 1, workPackageNumber: 0 },
  dateCreated: new Date('08/01/20'),
  name: 'Impact Attenuator',
  status: WbsElementStatus.Active,
  lead: exampleProjectLeadUser,
  manager: exampleLeadershipUser,
  links: exampleLinks,
  summary: 'Make an impact attenuator',
  budget: 124,
  teams: [],
  descriptionBullets: [],
  favoritedBy: [],
  wbsElementId: 4,
  changes: [
    {
      changeId: 10,
      changeRequestId: 37,
      wbsNum: exampleWbsProject1,
      implementer: exampleAdminUser,
      detail: 'Added goal for weight reduction',
      dateImplemented: new Date('02/25/21')
    }
  ],
  duration: 8,
  startDate: new Date('01/01/21'),
  endDate: new Date('02/26/21'),
  workPackages: [exampleResearchWorkPackage, exampleDesignWorkPackage],
  tasks: [],
  materials: [],
  assemblies: []
};

export const exampleProject2: Project = {
  id: 5,
  wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 0 },
  dateCreated: new Date('08/02/20'),
  name: 'Bodywork',
  status: WbsElementStatus.Inactive,
  lead: exampleProjectLeadUser,
  manager: exampleProjectManagerUser,
  links: exampleLinks,
  summary: 'Do some bodywork',
  budget: 50,
  descriptionBullets: [],
  favoritedBy: [],
  wbsElementId: 5,
  changes: [],
  duration: 0,
  startDate: undefined,
  endDate: undefined,
  workPackages: [],
  tasks: [],
  teams: [],
  materials: [],
  assemblies: []
};

export const exampleProject3: Project = {
  id: 6,
  wbsNum: exampleWbsProject1,
  dateCreated: new Date('08/04/20'),
  name: 'Battery Box',
  status: WbsElementStatus.Active,
  lead: exampleLeadershipUser,
  manager: exampleProjectManagerUser,
  links: exampleLinks,
  summary: 'Make a box for the battery',
  budget: 5000,
  descriptionBullets: [],
  favoritedBy: [],
  wbsElementId: 5,
  changes: [],
  duration: 3,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/22/21'),
  workPackages: [exampleResearchWorkPackage],
  teams: [exampleTeam],
  tasks: [exampleTask1],
  materials: [],
  assemblies: []
};

export const exampleProject4: Project = {
  id: 7,
  wbsNum: exampleWbsProject2,
  dateCreated: new Date('11/07/20'),
  name: 'Motor Controller Integration',
  status: WbsElementStatus.Inactive,
  lead: exampleLeadershipUser,
  manager: exampleAdminUser,
  links: exampleLinks,
  summary: 'Integrate the motor controller',
  budget: 0,
  teams: [],
  descriptionBullets: [],
  favoritedBy: [],
  wbsElementId: 5,
  changes: [],
  duration: 5,
  startDate: new Date('01/22/21'),
  endDate: new Date('02/26/21'),
  workPackages: [exampleDesignWorkPackage],
  tasks: [],
  materials: [],
  assemblies: []
};

export const exampleProject5: Project = {
  id: 8,
  wbsNum: { carNumber: 2, projectNumber: 7, workPackageNumber: 0 },
  dateCreated: new Date('08/03/20'),
  name: 'Wiring Harness',
  status: WbsElementStatus.Complete,
  lead: exampleProjectLeadUser,
  manager: exampleProjectManagerUser,
  links: exampleLinks,
  summary: 'Harness the wiring',
  budget: 234,
  descriptionBullets: [],
  teams: [],
  favoritedBy: [],
  wbsElementId: 5,
  changes: [],
  duration: 2,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/15/21'),
  workPackages: [exampleManufacturingWorkPackage],
  tasks: [],
  materials: [],
  assemblies: []
};

export const exampleAllProjects: Project[] = [
  exampleProject1,
  exampleProject2,
  exampleProject3,
  exampleProject4,
  exampleProject5
];
