/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPL v3.
 * See the LICENSE file in the repository root folder for details.
 */

const dbSeedProposedSolution1: any = {
  description: 'example solution 1 for change request 1',
  changeRequestId: 1,
  createdByUserId: 2,
  dateCreated: new Date('09/22/22 10:11:23'),
  approved: true
};

const dbSeedProposedSolution2: any = {
  description: 'example solution 1 for change request 2',
  changeRequestId: 2,
  createdByUserId: 3,
  dateCreated: new Date('09/23/22 17:26:13'),
  approved: false
};

const dbSeedProposedSolution3: any = {
  description: 'example solution 2 for change request 2',
  changeRequestId: 2,
  createdByUserId: 3,
  dateCreated: new Date('09/23/22 17:28:45'),
  approved: true
};

const dbSeedProposedSolution4: any = {
  description: 'example solution 1 for change request 3',
  changeRequestId: 3,
  createdByUserId: 4,
  dateCreated: new Date('09/24/22 14:52:07'),
  approved: false
};

const dbSeedProposedSolution5: any = {
  description: 'example solution 2 for change request 3',
  changeRequestId: 3,
  createdByUserId: 4,
  dateCreated: new Date('09/24/22 14:55:32'),
  approved: false
};

const dbSeedProposedSolution6: any = {
  description: 'example solution 3 for change request 3',
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
