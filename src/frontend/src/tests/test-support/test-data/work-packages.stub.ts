/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsElementStatus, WorkPackage, TimelineStatus } from 'shared';
import {
  exampleAdminUser,
  exampleAppAdminUser,
  exampleGuestUser,
  exampleLeadershipUser,
  exampleProjectLeadUser,
  exampleProjectManagerUser
} from './users.stub';
import {
  exampleWbsProject1,
  exampleWbsProject2,
  exampleWbsWorkPackage1,
  exampleWbsWorkPackage2
} from './wbs-numbers.stub';

export const exampleWorkPackage1: WorkPackage = {
  id: 1,
  wbsNum: exampleWbsWorkPackage1,
  dateCreated: new Date('11/15/20'),
  name: 'Bodywork Concept of Design',
  status: WbsElementStatus.Active,
  projectLead: exampleAdminUser,
  projectManager: exampleLeadershipUser,
  orderInProject: 1,
  progress: 25,
  expectedProgress: 50,
  timelineStatus: TimelineStatus.OnTrack,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/22/21'),
  duration: 3,
  dependencies: [],
  expectedActivities: [
    {
      id: 1,
      detail:
        'Assess the bodywork captsone and determine what can be learned from their deliverables',
      dateAdded: new Date('11/15/20')
    },
    {
      id: 2,
      detail:
        'Compare various material, design, segmentation, and mounting choices available and propose the best combination',
      dateAdded: new Date('11/15/20')
    }
  ],
  deliverables: [
    {
      id: 25,
      detail: 'High-level anaylsis of options and direction to go in for the project',
      dateAdded: new Date('11/11/20')
    }
  ],
  changes: [
    {
      changeId: 1,
      changeRequestId: 33,
      wbsNum: exampleWbsWorkPackage2,
      implementer: exampleGuestUser,
      detail: 'Increased funding by $500.',
      dateImplemented: new Date('11/15/2003')
    }
  ]
};

export const exampleWorkPackage2: WorkPackage = {
  id: 2,
  wbsNum: {
    carNumber: 1,
    projectNumber: 1,
    workPackageNumber: 2
  },
  dateCreated: new Date('10/02/20'),
  name: 'Adhesive Shear Strength Test',
  status: WbsElementStatus.Inactive,
  projectLead: exampleProjectLeadUser,
  projectManager: exampleLeadershipUser,
  orderInProject: 2,
  progress: 0,
  expectedProgress: 0,
  timelineStatus: TimelineStatus.OnTrack,
  startDate: new Date('01/22/21'),
  endDate: new Date('02/26/21'),
  duration: 5,
  dependencies: [exampleWbsWorkPackage1],
  expectedActivities: [
    {
      id: 3,
      detail:
        'Build a test procedure for destructively measuring the shear strength of various adhesives interacting with foam and steel plates',
      dateAdded: new Date('10/02/20')
    },
    {
      id: 4,
      detail: 'Design and manufacture test fixtures to perform destructive testing',
      dateAdded: new Date('10/02/20')
    },
    {
      id: 5,
      detail: 'Write a report to summarize findings',
      dateAdded: new Date('10/05/20')
    }
  ],
  deliverables: [
    {
      id: 26,
      detail:
        'Lab report with full data on the shear strength of adhesives under test including a summary and conclusion of which adhesive is best',
      dateAdded: new Date('10/10/20')
    }
  ],
  changes: [
    {
      changeId: 2,
      changeRequestId: 1,
      wbsNum: exampleWbsWorkPackage2,
      implementer: exampleAppAdminUser,
      detail: 'Decreased duration from 10 weeks to 7 weeks.',
      dateImplemented: new Date('03/24/21')
    },

    {
      changeId: 13,
      changeRequestId: 54,
      wbsNum: exampleWbsWorkPackage1,
      implementer: exampleProjectLeadUser,
      detail: 'Added "jet fuel burns hot" bullet.',
      dateImplemented: new Date('03/24/21')
    }
  ]
};

export const exampleWorkPackage3: WorkPackage = {
  id: 3,
  wbsNum: exampleWbsWorkPackage2,
  dateCreated: new Date('09/27/20'),
  name: 'Manufacture Wiring Harness',
  status: WbsElementStatus.Complete,
  projectLead: exampleLeadershipUser,
  projectManager: exampleProjectManagerUser,
  orderInProject: 3,
  progress: 100,
  expectedProgress: 100,
  timelineStatus: TimelineStatus.OnTrack,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/15/21'),
  duration: 2,
  dependencies: [exampleWbsProject1, exampleWbsProject2],
  expectedActivities: [
    {
      id: 6,
      detail: 'Manufacutre section A of the wiring harness',
      dateAdded: new Date('09/27/20')
    },
    {
      id: 7,
      detail: 'Determine which portion of the wiring harness is important',
      dateAdded: new Date('09/27/20'),
      dateDeleted: new Date('10/16/20')
    },
    {
      id: 8,
      detail: 'Solder wiring segments together and heat shrink properly',
      dateAdded: new Date('09/30/20')
    },
    {
      id: 9,
      detail: 'Cut all wires to length',
      dateAdded: new Date('11/6/20')
    }
  ],
  deliverables: [
    {
      id: 27,
      detail: 'Completed wiring harness for the entire car',
      dateAdded: new Date('09/29/20')
    }
  ],
  changes: [
    {
      changeId: 7,
      changeRequestId: 14,
      wbsNum: exampleWbsWorkPackage1,
      implementer: exampleAdminUser,
      detail: 'Increased budget from $10 to $200.',
      dateImplemented: new Date('03/24/21')
    }
  ]
};

export const exampleAllWorkPackages: WorkPackage[] = [
  exampleWorkPackage1,
  exampleWorkPackage2,
  exampleWorkPackage3
];
