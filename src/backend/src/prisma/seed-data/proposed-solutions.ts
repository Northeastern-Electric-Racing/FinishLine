/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPL v3.
 * See the LICENSE file in the repository root folder for details.
 */

const dbSeedProposedSolution1: any = {
  proposedSolutionId: '1',
  description: 'test',
  timelineImpact: 10,
  budgetImpact: 50000,
  scopeImpact: 'test',
  changeRequestId: 2,
  createdByUserId: 1,
  dateCreated: new Date('05/22/22'),
  approved: false
};

const dbSeedProposedSolution2: any = {
  proposedSolutionId: '2',
  description: 'test',
  timelineImpact: 10,
  budgetImpact: 50000,
  scopeImpact: 'test',
  changeRequestId: 2,
  createdByUserId: 1,
  dateCreated: new Date('05/23/22'),
  approved: false
};

export const dbSeedAllProposedSolutions: any[] = [dbSeedProposedSolution1, dbSeedProposedSolution2];
