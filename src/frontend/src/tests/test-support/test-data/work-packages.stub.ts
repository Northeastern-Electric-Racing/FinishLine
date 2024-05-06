/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsElementStatus, WorkPackage, TimelineStatus, WorkPackageStage } from 'shared';
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
  exampleWbsWorkPackage2,
  exampleWbsWorkPackage3,
  exampleWbsWorkPackage4,
  exampleWbsWorkPackage5
} from './wbs-numbers.stub';

export const exampleResearchWorkPackage: WorkPackage = {
  id: 1,
  wbsNum: exampleWbsWorkPackage1,
  dateCreated: new Date('11/15/20'),
  name: 'Bodywork Concept of Design',
  status: WbsElementStatus.Active,
  lead: exampleAdminUser,
  manager: exampleLeadershipUser,
  orderInProject: 1,
  progress: 25,
  expectedProgress: 50,
  timelineStatus: TimelineStatus.OnTrack,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/22/21'),
  duration: 3,
  blockedBy: [],
  links: [],
  expectedActivities: [
    {
      id: 1,
      detail: 'Assess the bodywork captsone and determine what can be learned from their deliverables',
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
      wbsNum: exampleWbsWorkPackage3,
      implementer: exampleGuestUser,
      detail: 'Increased funding by $500.',
      dateImplemented: new Date('11/15/2003')
    }
  ],
  projectName: 'project1',
  stage: WorkPackageStage.Research,
  materials: [],
  assemblies: []
};

export const exampleDesignWorkPackage: WorkPackage = {
  id: 2,
  wbsNum: exampleWbsWorkPackage2,
  dateCreated: new Date('10/02/20'),
  name: 'Adhesive Shear Strength Test',
  status: WbsElementStatus.Inactive,
  lead: exampleProjectLeadUser,
  manager: exampleLeadershipUser,
  orderInProject: 2,
  progress: 0,
  expectedProgress: 0,
  timelineStatus: TimelineStatus.OnTrack,
  startDate: new Date('01/22/21'),
  endDate: new Date('02/26/21'),
  duration: 5,
  blockedBy: [exampleWbsWorkPackage1],
  links: [],
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
      wbsNum: exampleWbsWorkPackage3,
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
  ],
  projectName: 'project2',
  stage: WorkPackageStage.Design,
  materials: [],
  assemblies: []
};

export const exampleManufacturingWorkPackage: WorkPackage = {
  id: 3,
  wbsNum: exampleWbsWorkPackage3,
  dateCreated: new Date('09/27/20'),
  name: 'Manufacture Wiring Harness',
  status: WbsElementStatus.Complete,
  lead: exampleLeadershipUser,
  manager: exampleProjectManagerUser,
  orderInProject: 3,
  progress: 100,
  expectedProgress: 100,
  timelineStatus: TimelineStatus.OnTrack,
  startDate: new Date('01/01/21'),
  endDate: new Date('01/15/21'),
  duration: 2,
  blockedBy: [exampleWbsProject1, exampleWbsProject2],
  links: [],
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
  ],
  projectName: 'project3',
  stage: WorkPackageStage.Manufacturing,
  materials: [],
  assemblies: []
};

export const exampleInstallWorkPackage: WorkPackage = {
  id: 4,
  wbsNum: exampleWbsWorkPackage4,
  dateCreated: new Date('2022-02-20'),
  name: 'Install Wiring Harness',
  status: WbsElementStatus.Complete,
  lead: exampleLeadershipUser,
  manager: exampleProjectManagerUser,
  orderInProject: 4,
  progress: 0,
  expectedProgress: 100,
  timelineStatus: TimelineStatus.VeryBehind,
  startDate: new Date('2022-02-20'),
  endDate: new Date('2022-02-27'),
  duration: 1,
  blockedBy: [exampleWbsWorkPackage3],
  links: [],
  expectedActivities: [
    {
      id: 10,
      detail: 'Purchase attachment hardware',
      dateAdded: new Date('2022-02-20')
    },
    {
      id: 11,
      detail: 'Complete installation',
      dateAdded: new Date('2022-02-20')
    },
    {
      id: 12,
      detail: 'Check for safety and rules compliance',
      dateAdded: new Date('2022-02-20')
    }
  ],
  deliverables: [
    {
      id: 28,
      detail: 'Harness is attached strongly and in compliance with the rules',
      dateAdded: new Date('2022-02-20')
    }
  ],
  changes: [
    {
      changeId: 8,
      changeRequestId: 15,
      wbsNum: exampleWbsWorkPackage1,
      implementer: exampleAdminUser,
      detail: 'New Work Package Created',
      dateImplemented: new Date('2022-02-20')
    }
  ],
  projectName: 'project3',
  stage: WorkPackageStage.Install,
  materials: [],
  assemblies: []
};

export const exampleWorkPackage5: WorkPackage = {
  id: 5,
  wbsNum: exampleWbsWorkPackage5,
  dateCreated: new Date('2022-02-20'),
  name: 'Party In Celebration',
  status: WbsElementStatus.Complete,
  lead: exampleLeadershipUser,
  manager: exampleProjectManagerUser,
  orderInProject: 5,
  progress: 100,
  expectedProgress: 100,
  timelineStatus: TimelineStatus.OnTrack,
  startDate: new Date('2022-02-21'),
  endDate: new Date('2022-02-28'),
  duration: 1,
  blockedBy: [],
  links: [],
  expectedActivities: [
    {
      id: 13,
      detail: 'YAYYYYYYY',
      dateAdded: new Date('2022-02-21')
    }
  ],
  deliverables: [
    {
      id: 29,
      detail: 'Stomachs full with CAKE',
      dateAdded: new Date('2022-02-21')
    }
  ],
  changes: [
    {
      changeId: 9,
      changeRequestId: 16,
      wbsNum: exampleWbsWorkPackage1,
      implementer: exampleAdminUser,
      detail: 'New Work Package Created',
      dateImplemented: new Date('2022-02-21')
    }
  ],
  projectName: 'project3',
  materials: [],
  assemblies: []
};

export const exampleAllWorkPackages: WorkPackage[] = [
  exampleResearchWorkPackage,
  exampleDesignWorkPackage,
  exampleManufacturingWorkPackage
];
