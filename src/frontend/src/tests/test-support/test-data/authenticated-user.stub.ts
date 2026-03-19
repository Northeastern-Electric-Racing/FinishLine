/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { RoleEnum, AuthenticatedUser } from 'shared';

export const exampleAuthenticatedAdminUser: AuthenticatedUser = {
  userId: '2',
  firstName: 'Joe',
  lastName: 'Shmoe',
  email: 'shmoe.j@husky.neu.edu',
  role: RoleEnum.ADMIN,
  organizations: ['yello'],
  onboardingTeamTypeIds: [],
  onboardedTeamTypeIds: []
};

export const exampleAuthenticatedGuestUser: AuthenticatedUser = {
  userId: '5',
  firstName: 'Guest',
  lastName: 'User',
  email: 'guest@ner.edu',
  role: RoleEnum.GUEST,
  organizations: ['foo'],
  onboardingTeamTypeIds: [],
  onboardedTeamTypeIds: []
};

export const exampleAuthenticatedMemberUser: AuthenticatedUser = {
  userId: '6',
  firstName: 'Member',
  lastName: 'User',
  email: 'member@ner.edu',
  role: RoleEnum.MEMBER,
  organizations: ['bar'],
  onboardingTeamTypeIds: [],
  onboardedTeamTypeIds: []
};
