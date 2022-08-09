/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { CR_Type, Scope_CR_Why_Type } from '@prisma/client';

const dbSeedChangeRequest1: any = {
  submitterId: 2,
  wbsElementId: 8,
  changeRequestFields: {
    dateSubmitted: new Date('02/25/21'),
    type: CR_Type.ISSUE,
    dateReviewed: new Date('03/01/21'),
    accepted: true,
    reviewNotes: 'Adjust description, increase budget to 200, and add 3 weeks'
  },
  changes: [
    {
      dateImplemented: new Date('02/10/21'),
      implementerId: 1,
      wbsElementId: 8,
      detail: 'Added "big spacers" bullet.'
    },
    {
      dateImplemented: new Date('02/10/21'),
      implementerId: 2,
      wbsElementId: 8,
      detail: 'Increased budget from $124 to $224.'
    },
    {
      implementerId: 1,
      wbsElementId: 8,
      detail: 'Increased duration from 2 weeks to 5 weeks.'
    }
  ],
  scopeChangeRequestFields: {
    otherFields: {
      what: 'Spacers are needed to prevent the jet fuel from melting the I beams',
      scopeImpact: 'Design and machine titanium spacers',
      budgetImpact: 75,
      timelineImpact: 2
    },
    why: [
      {
        type: Scope_CR_Why_Type.ESTIMATION,
        explain: 'Original estimate did not account for spacers'
      },
      {
        type: Scope_CR_Why_Type.MANUFACTURING,
        explain: 'No availibilitiy in Richards'
      },
      {
        type: Scope_CR_Why_Type.OTHER,
        explain: "Matt won't shut up"
      },
      {
        type: Scope_CR_Why_Type.OTHER_PROJECT,
        explain: '2.2.0'
      },
      {
        type: Scope_CR_Why_Type.RULES,
        explain: 'Discovered rule EV 5.2.6'
      },
      {
        type: Scope_CR_Why_Type.SCHOOL,
        explain: 'All team members had 5 midterms each'
      }
    ]
  }
};

const dbSeedChangeRequest2: any = {
  submitterId: 3,
  wbsElementId: 6,
  changeRequestFields: {
    dateSubmitted: new Date('01/04/21'),
    type: CR_Type.DEFINITION_CHANGE,
    dateReviewed: new Date('01/20/21'),
    accepted: true,
    reviewNotes: 'Adjust description, add $50 to budget, add 4 wks to duration'
  },
  changes: [
    {
      dateImplemented: new Date('02/10/21'),
      implementerId: 5,
      wbsElementId: 6,
      detail: 'Added "removable side panels" bullet.'
    },
    {
      dateImplemented: new Date('02/10/21'),
      implementerId: 5,
      wbsElementId: 7,
      detail: 'Increased budget from $0 to $50.'
    },
    {
      dateImplemented: new Date('02/10/21'),
      implementerId: 5,
      wbsElementId: 6,
      detail: 'Increased duration from 3 weeks to 7 weeks.'
    }
  ],
  scopeChangeRequestFields: {
    otherFields: {
      what:
        'It would be nice for the bodywork to have two removable side panels where they cover the pedal box',
      scopeImpact: 'New division of bodywork panels and adding removable mounting method',
      budgetImpact: 25,
      timelineImpact: 4
    },
    why: [
      {
        type: Scope_CR_Why_Type.OTHER,
        explain: 'This would make it easier to access the pedal box'
      },
      {
        type: Scope_CR_Why_Type.RULES,
        explain: 'Rules require removability'
      }
    ]
  }
};

const dbSeedChangeRequest3: any = {
  submitterId: 4,
  wbsElementId: 7,
  changeRequestFields: {
    type: CR_Type.OTHER,
    dateReviewed: new Date('01/15/22'),
    accepted: false,
    reviewNotes: 'Instron preferrable for data, this is not a hurry. No action required.'
  },
  changes: [],
  scopeChangeRequestFields: {
    otherFields: {
      what: 'Do the glue tests with weights instead of Instron',
      scopeImpact: 'Reduce complexity without Instron',
      budgetImpact: 0,
      timelineImpact: 0
    },
    why: [
      {
        type: Scope_CR_Why_Type.OTHER,
        explain: 'We will have a long time before having access to the Instron'
      }
    ]
  }
};

const dbSeedChangeRequest4: any = {
  submitterId: 5,
  wbsElementId: 7,
  changeRequestFields: {
    dateSubmitted: new Date('04/19/21'),
    type: CR_Type.ACTIVATION
  },
  changes: [],
  activationChangeRequestFields: {
    otherFields: {
      startDate: new Date('05/01/21'),
      confirmDetails: true
    },
    projectLeadId: 3,
    projectManagerId: 5
  }
};

const dbSeedChangeRequest5: any = {
  submitterId: 6,
  wbsElementId: 8,
  changeRequestFields: {
    dateSubmitted: new Date('03/16/21'),
    type: CR_Type.STAGE_GATE
  },
  changes: [],
  stageGateChangeRequestFields: {
    leftoverBudget: 26,
    confirmDone: true
  }
};

const dbSeedChangeRequest6: any = {
  submitterId: 2,
  wbsElementId: 1,
  changeRequestFields: {
    dateSubmitted: new Date('04/13/21'),
    type: CR_Type.ISSUE,
    dateReviewed: new Date('04/21/21'),
    accepted: true,
    reviewNotes: 'Adjust goals and add 3 weeks'
  },
  changes: [
    {
      dateImplemented: new Date('04/25/21'),
      implementerId: 1,
      wbsElementId: 1,
      detail: 'Added goal for weight reduction'
    },
    {
      dateImplemented: new Date('04/25/21'),
      implementerId: 1,
      wbsElementId: 7,
      detail: 'Removed expected activity.'
    }
  ],
  scopeChangeRequestFields: {
    otherFields: {
      what: 'The subsytem is too heavy to meet performance targets',
      scopeImpact: 'Add requirements for specific weight reduction',
      budgetImpact: 0,
      timelineImpact: 0
    },
    why: [
      {
        type: Scope_CR_Why_Type.ESTIMATION,
        explain: 'Original estimate did not account for weight'
      },
      {
        type: Scope_CR_Why_Type.OTHER_PROJECT,
        explain: '2.2.0'
      }
    ]
  }
};

export const dbSeedAllChangeRequests: any[] = [
  dbSeedChangeRequest1,
  dbSeedChangeRequest2,
  dbSeedChangeRequest3,
  dbSeedChangeRequest4,
  dbSeedChangeRequest5,
  dbSeedChangeRequest6
];
