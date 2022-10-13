/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WBS_Element_Status } from '@prisma/client';

const dbSeedWorkPackage1: any = {
  projectId: 1,
  wbsElementFields: {
    carNumber: 1,
    projectNumber: 1,
    workPackageNumber: 1,
    dateCreated: new Date('11/15/20'),
    name: 'Bodywork Concept of Design',
    status: WBS_Element_Status.ACTIVE,
    projectLeadId: 4,
    projectManagerId: 5
  },
  workPackageFields: {
    orderInProject: 1,
    startDate: new Date('01/01/21'),
    progress: 25,
    duration: 3
  },
  expectedActivities: [
    {
      detail:
        'Assess the bodywork captsone and determine what can be learned from their deliverables',
      dateAdded: new Date('11/15/20')
    },
    {
      detail:
        'Compare various material, design, segmentation, and mounting choices available and propose the best combination',
      dateAdded: new Date('11/15/20')
    }
  ],
  deliverables: [
    {
      detail: 'High-level anaylsis of options and direction to go in for the project',
      dateAdded: new Date('11/11/20')
    }
  ]
};

const dbSeedWorkPackage2: any = {
  projectId: 1,
  wbsElementFields: {
    carNumber: 1,
    projectNumber: 1,
    workPackageNumber: 2,
    dateCreated: new Date('10/02/20'),
    name: 'Adhesive Shear Strength Test',
    status: WBS_Element_Status.INACTIVE,
    projectLeadId: 4,
    projectManagerId: 5
  },
  workPackageFields: {
    orderInProject: 2,
    startDate: new Date('01/01/21'),
    progress: 0,
    duration: 5
  },
  expectedActivities: [
    {
      detail:
        'Build a test procedure for destructively measuring the shear strength of various adhesives interacting with foam and steel plates',
      dateAdded: new Date('10/02/20')
    },
    {
      detail: 'Design and manufacture test fixtures to perform destructive testing',
      dateAdded: new Date('10/02/20')
    },
    {
      detail: 'Write a report to summarize findings',
      dateAdded: new Date('10/05/20')
    }
  ],
  deliverables: [
    {
      detail:
        'Lab report with full data on the shear strength of adhesives under test including a summary and conclusion of which adhesive is best',
      dateAdded: new Date('10/10/20')
    }
  ]
};

const dbSeedWorkPackage3: any = {
  projectId: 3,
  wbsElementFields: {
    carNumber: 1,
    projectNumber: 23,
    workPackageNumber: 3,
    dateCreated: new Date('09/27/20'),
    name: 'Manufacture Wiring Harness',
    status: WBS_Element_Status.COMPLETE,
    projectLeadId: 4,
    projectManagerId: 5
  },
  workPackageFields: {
    orderInProject: 3,
    startDate: new Date('01/01/21'),
    progress: 100,
    duration: 2
  },
  expectedActivities: [
    {
      detail: 'Manufacutre section A of the wiring harness',
      dateAdded: new Date('09/27/20')
    },
    {
      detail: 'Determine which portion of the wiring harness is important',
      dateAdded: new Date('09/27/20'),
      dateDeleted: new Date('10/16/20')
    },
    {
      detail: 'Solder wiring segments together and heat shrink properly',
      dateAdded: new Date('09/30/20')
    },
    {
      detail: 'Cut all wires to length'
    }
  ],
  deliverables: [
    {
      detail: 'Completed wiring harness for the entire car',
      dateAdded: new Date('09/29/20')
    }
  ]
};

export const dbSeedAllWorkPackages: any[] = [
  dbSeedWorkPackage1,
  dbSeedWorkPackage2,
  dbSeedWorkPackage3
];
