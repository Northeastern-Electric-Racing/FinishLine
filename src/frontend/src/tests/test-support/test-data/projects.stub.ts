/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link, LinkType, ProjectDetail, WbsElementStatus } from 'shared';
import { exampleTeam } from './teams.stub';
import { exampleAdminUser, exampleLeadershipUser, exampleLeadUser, exampleManagerUser } from './users.stub';
import { exampleWbsProject1, exampleWbsProject2 } from './wbs-numbers.stub';
import { exampleResearchWorkPackage, exampleDesignWorkPackage, exampleManufacturingWorkPackage } from './work-packages.stub';

const exampleConfluenceLinkType: LinkType = {
  name: 'Confluence',
  iconName: 'confluence',
  required: true,
  isOnGuestHomePage: false,
  isOnNewMemberDashboard: false,
  isOnOnboardingDashboard: false
};

const exampleBomLinkType: LinkType = {
  name: 'BOM',
  iconName: 'bom',
  required: true,
  isOnGuestHomePage: false,
  isOnNewMemberDashboard: false,
  isOnOnboardingDashboard: false
};

const exampleGDriveLinkType: LinkType = {
  name: 'Google Drive',
  iconName: 'google-drive',
  required: true,
  isOnGuestHomePage: false,
  isOnNewMemberDashboard: false,
  isOnOnboardingDashboard: false
};

const exampleLinks: Link[] = [
  {
    linkId: '1',
    linkType: exampleConfluenceLinkType,
    url: 'https://www.google.com'
  },
  {
    linkId: '2',
    linkType: exampleBomLinkType,
    url: 'https://www.google.com'
  },
  {
    linkId: '3',
    linkType: exampleGDriveLinkType,
    url: 'https://www.google.com'
  }
];
export const exampleProject1: ProjectDetail = {
  id: '4',
  wbsNum: { carNumber: 1, projectNumber: 1, workPackageNumber: 0 },
  name: 'Impact Attenuator',
  status: WbsElementStatus.Active,
  lead: exampleLeadUser,
  manager: exampleLeadershipUser,
  links: exampleLinks,
  summary: 'Make an impact attenuator',
  budget: 124,
  teams: [],
  descriptionBullets: [],
  isFavorited: false,
  isOnProjectTeam: false,
  wbsElementId: '4',
  changes: [
    {
      changeId: '10',
      changeRequestId: '37',
      implementer: exampleAdminUser,
      detail: 'Added goal for weight reduction',
      dateImplemented: new Date('02/25/21'),
      changeRequestIdentifier: 1
    }
  ],
  duration: 8,
  startDate: new Date('01/01/21'),
  endDate: new Date('02/26/21'),
  workPackages: [exampleResearchWorkPackage, exampleDesignWorkPackage]
};

export const exampleProject2: ProjectDetail = {
  id: '5',
  wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 0 },
  name: 'Bodywork',
  status: WbsElementStatus.Inactive,
  lead: exampleLeadUser,
  manager: exampleManagerUser,
  links: exampleLinks,
  summary: 'Do some bodywork',
  budget: 50,
  descriptionBullets: [],
  isFavorited: false,
  isOnProjectTeam: false,
  wbsElementId: '5',
  changes: [],
  duration: 0,
  startDate: undefined,
  endDate: undefined,
  workPackages: [],
  teams: []
};

export const exampleProject3: ProjectDetail = {
  id: '6',
  wbsNum: exampleWbsProject1,
  name: 'Battery Box',
  status: WbsElementStatus.Active,
  lead: exampleLeadershipUser,
  manager: exampleManagerUser,
  links: exampleLinks,
  summary: 'Make a box for the battery',
  budget: 5000,
  descriptionBullets: [],
  isFavorited: false,
  isOnProjectTeam: false,
  wbsElementId: '5',
  changes: [],
  duration: 3,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/22/21'),
  workPackages: [exampleResearchWorkPackage],
  teams: [{ teamId: exampleTeam.teamId, teamName: exampleTeam.teamName }]
};

export const exampleProject4: ProjectDetail = {
  id: '7',
  wbsNum: exampleWbsProject2,
  name: 'Motor Controller Integration',
  status: WbsElementStatus.Inactive,
  lead: exampleLeadershipUser,
  manager: exampleAdminUser,
  links: exampleLinks,
  summary: 'Integrate the motor controller',
  budget: 0,
  teams: [],
  descriptionBullets: [],
  isFavorited: false,
  isOnProjectTeam: false,
  wbsElementId: '5',
  changes: [],
  duration: 5,
  startDate: new Date('01/22/21'),
  endDate: new Date('02/26/21'),
  workPackages: [exampleDesignWorkPackage]
};

export const exampleProject5: ProjectDetail = {
  id: '8',
  wbsNum: { carNumber: 2, projectNumber: 7, workPackageNumber: 0 },
  name: 'Wiring Harness',
  status: WbsElementStatus.Complete,
  lead: exampleLeadUser,
  manager: exampleManagerUser,
  links: exampleLinks,
  summary: 'Harness the wiring',
  budget: 234,
  descriptionBullets: [],
  teams: [],
  isFavorited: false,
  isOnProjectTeam: false,
  wbsElementId: '5',
  changes: [],
  duration: 2,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/15/21'),
  workPackages: [exampleManufacturingWorkPackage]
};

export const exampleAllProjects: ProjectDetail[] = [
  exampleProject1,
  exampleProject2,
  exampleProject3,
  exampleProject4,
  exampleProject5
];
