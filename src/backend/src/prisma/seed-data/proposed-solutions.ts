/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPL v3.
 * See the LICENSE file in the repository root folder for details.
 */

const dbSeedProposedSolution1: any = {
  description: 'Titanium spacers should be able to block the jet fuel',
  timelineImpact: 2,
  budgetImpact: 75,
  scopeImpact: 'Design and machine titanium spacers',
  changeRequestId: 1,
  createdByUserId: 2,
  dateCreated: new Date('09/22/22 10:11:23'),
  approved: true
};

const dbSeedProposedSolution2: any = {
  description: 'Change the current design',
  timelineImpact: 5,
  budgetImpact: 20,
  scopeImpact: 'Modify bodyworks to integrate side panels into the body',
  changeRequestId: 2,
  createdByUserId: 3,
  dateCreated: new Date('09/23/22 17:26:13'),
  approved: false
};

const dbSeedProposedSolution3: any = {
  description: 'Add to the current design',
  timelineImpact: 4,
  budgetImpact: 25,
  scopeImpact: 'New division of bodywork panels and adding removable mounting method',
  changeRequestId: 2,
  createdByUserId: 3,
  dateCreated: new Date('09/23/22 17:28:45'),
  approved: true
};

const dbSeedProposedSolution4: any = {
  description: 'Avoid using instron entirely',
  timelineImpact: 3,
  budgetImpact: 50,
  scopeImpact: 'Reduce complexity without Instron',
  changeRequestId: 3,
  createdByUserId: 4,
  dateCreated: new Date('09/24/22 14:52:07'),
  approved: false
};

const dbSeedProposedSolution5: any = {
  description: 'Look for other options other than those mentioned',
  timelineImpact: 1,
  budgetImpact: 120,
  scopeImpact: 'Find replacement and check feasibility',
  changeRequestId: 3,
  createdByUserId: 4,
  dateCreated: new Date('09/24/22 14:55:32'),
  approved: false
};

const dbSeedProposedSolution6: any = {
  description: 'No changes made',
  timelineImpact: 4,
  budgetImpact: 55,
  scopeImpact: 'Continue using Instron, maintain current complexity',
  changeRequestId: 3,
  createdByUserId: 4,
  dateCreated: new Date('09/25/22 15:01:28'),
  approved: false
};

export const dbSeedAllProposedSolutions: any[] = [
  dbSeedProposedSolution1,
  dbSeedProposedSolution2,
  dbSeedProposedSolution3,
  dbSeedProposedSolution4,
  dbSeedProposedSolution5,
  dbSeedProposedSolution6
];
