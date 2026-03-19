/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { RoleEnum, AuthenticatedUser, UserWithRole } from 'shared';

export const exampleAuthenticatedUser: AuthenticatedUser = {
  userId: 'uuid',
  firstName: 'current',
  lastName: 'user',
  email: 'iluvner@northeastern.edu',
  role: RoleEnum.ADMIN,
  organizations: [],
  onboardingTeamTypeIds: [],
  onboardedTeamTypeIds: []
};

export const exampleAppAdminUser: UserWithRole = {
  userId: '1',
  firstName: 'Thomas',
  lastName: 'Emrax',
  email: 'emrax.t@husky.neu.edu',
  role: RoleEnum.APP_ADMIN
};

export const exampleAdminUser: UserWithRole = {
  userId: '2',
  firstName: 'Joe',
  lastName: 'Shmoe',
  email: 'shmoe.j@husky.neu.edu',
  role: RoleEnum.ADMIN
};

export const exampleAdminUser2: UserWithRole = {
  userId: '8',
  firstName: 'Joe',
  lastName: 'Shmoseph',
  email: 'shmoseph.j@husky.neu.edu',
  role: RoleEnum.ADMIN
};

export const exampleLeadershipUser: UserWithRole = {
  userId: '3',
  firstName: 'Joe',
  lastName: 'Blow',
  email: 'blow.j@husky.neu.edu',
  role: RoleEnum.LEADERSHIP
};

export const exampleLeadUser: UserWithRole = {
  userId: '4',
  firstName: 'Amy',
  lastName: 'Smith',
  email: 'smith.a@husky.neu.edu',
  role: RoleEnum.HEAD
};

export const exampleManagerUser: UserWithRole = {
  userId: '5',
  firstName: 'Rachel',
  lastName: 'Barmatha',
  email: 'barmatha.r@husky.neu.edu',
  role: RoleEnum.MEMBER
};

export const exampleMemberUser: UserWithRole = {
  userId: '6',
  firstName: 'Emily',
  lastName: 'Bendara',
  email: 'bendara.e@husky.neu.edu',
  role: RoleEnum.HEAD
};

export const exampleGuestUser: UserWithRole = {
  userId: '7',
  firstName: 'Jackson',
  lastName: 'James',
  email: 'james.j@husky.neu.edu',
  role: RoleEnum.GUEST
};

export const exampleGuestUser2: UserWithRole = {
  userId: '8',
  firstName: 'James',
  lastName: 'Jackson',
  email: 'jackson.j@husky.neu.edu',
  role: RoleEnum.GUEST
};

export const exampleAllUsers: UserWithRole[] = [
  exampleAppAdminUser,
  exampleAdminUser,
  exampleLeadershipUser,
  exampleLeadUser,
  exampleManagerUser,
  exampleMemberUser,
  exampleGuestUser
];
