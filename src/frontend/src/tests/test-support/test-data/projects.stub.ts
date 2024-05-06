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
  rules: ['EV3.5.2'],
  teams: [],
  goals: [
    {
      id: 15,
      detail: 'Decrease size by 90% from 247 cubic inches to 24.7 cubic inches',
      dateAdded: new Date('05/26/21')
    }
  ],
  features: [
    {
      id: 20,
      detail: 'Capable of absorbing 5000N in a head-on collision',
      dateAdded: new Date('05/26/21')
    }
  ],
  otherConstraints: [
    {
      id: 10,
      detail: 'Cannot go further towards the rear of the car than the front roll hoop',
      dateAdded: new Date('05/27/21')
    }
  ],
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
  rules: ['T12.3.2', 'T8.2.6'],
  goals: [
    {
      id: 16,
      detail: 'Decrease weight by 90% from 4.8 pounds to 0.48 pounds',
      dateAdded: new Date('06/10/21')
    }
  ],
  features: [
    {
      id: 21,
      detail: 'Provides removable section for easy access to the pedal box',
      dateAdded: new Date('06/11/21')
    }
  ],
  otherConstraints: [{ id: 11, detail: 'Compatible with a side-pod chassis design', dateAdded: new Date('06/12/21') }],
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
  rules: ['EV3.5.2', 'EV1.4.7', 'EV6.3.10'],
  goals: [
    {
      id: 17,
      detail: 'Decrease weight by 60% from 100 pounds to 40 pounds',
      dateAdded: new Date('08/02/21')
    }
  ],
  features: [
    {
      id: 22,
      detail: 'Provides 50,000 Wh of energy discharge',
      dateAdded: new Date('08/01/21')
    }
  ],
  otherConstraints: [
    {
      id: 12,
      detail: 'Maximum power consumption of 25 watts from the low voltage system',
      dateAdded: new Date('08/05/21')
    }
  ],
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
  rules: [],
  teams: [],
  goals: [
    {
      id: 18,
      detail: 'Power consumption stays under 10 watts from the low voltage system',
      dateAdded: new Date('05/11/21')
    }
  ],
  features: [
    {
      id: 23,
      detail: 'Capable of interfacing via I2C or comparable serial interface.',
      dateAdded: new Date('05/14/21')
    }
  ],
  otherConstraints: [{ id: 13, detail: 'Must be compatible with chain drive', dateAdded: new Date('05/12/21') }],
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
  rules: ['EV3.5.2', 'T12.3.2', 'T8.2.6', 'EV1.4.7', 'EV6.3.10'],
  teams: [],
  goals: [
    {
      id: 19,
      detail: 'Decrease installed component costs by 63% from $2,700 to $1000',
      dateAdded: new Date('02/05/21')
    }
  ],
  features: [
    {
      id: 24,
      detail: 'All wires are bundled and secured to the chassis at least every 6 inches',
      dateAdded: new Date('02/14/21')
    }
  ],
  otherConstraints: [{ id: 14, detail: 'Utilizes 8020 frame construction', dateAdded: new Date('02/16/21') }],
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
