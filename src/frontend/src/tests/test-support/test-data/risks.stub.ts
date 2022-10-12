/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Risk } from 'shared/src/types/risk-types';
import { exampleProject1, exampleProject2, exampleProject3 } from './projects.stub';
import { exampleMemberUser, exampleProjectLeadUser, exampleProjectManagerUser } from './users.stub';

export const exampleRisk1: Risk = {
  id: 'risk1',
  project: exampleProject1,
  detail: 'Risk #1',
  isResolved: false,
  dateCreated: new Date('2022-08-10'),
  createdBy: exampleMemberUser
};

export const exampleRisk2: Risk = {
  id: 'risk2',
  project: exampleProject2,
  detail: 'Risk #2',
  isResolved: true,
  dateCreated: new Date('2022-06-09'),
  createdBy: exampleProjectLeadUser,
  resolvedBy: exampleMemberUser,
  resolvedAt: new Date('2022-07-27')
};

export const exampleRisk3: Risk = {
  id: 'risk3',
  project: exampleProject3,
  detail: 'Risk #3',
  isResolved: false,
  dateCreated: new Date('2021-04-20'),
  createdBy: exampleProjectManagerUser
};

export const exampleRisk4: Risk = {
  id: 'risk4',
  project: exampleProject1,
  detail: 'Risk #4',
  isResolved: true,
  dateCreated: new Date('2022-08-10'),
  createdBy: exampleMemberUser
};
