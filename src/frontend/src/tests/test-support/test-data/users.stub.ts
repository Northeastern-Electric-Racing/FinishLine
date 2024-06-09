/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User, RoleEnum, AuthenticatedUser } from 'shared';

export const exampleAppAdminUser: User = {
  userId: '1',
  firstName: 'Thomas',
  lastName: 'Emrax',
  email: 'emrax.t@husky.neu.edu',
  emailId: 'emrax.t',
  role: RoleEnum.APP_ADMIN
};

export const exampleAdminUser: AuthenticatedUser = {
  userId: '2',
  firstName: 'Joe',
  lastName: 'Shmoe',
  email: 'shmoe.j@husky.neu.edu',
  emailId: 'shmoe.j',
  role: RoleEnum.ADMIN,
  favoritedProjectsId: [],
  changeRequestsToReviewId: [],
  organizations: ['yello']
};

export const exampleAdminUser2: AuthenticatedUser = {
  userId: '8',
  firstName: 'Joe',
  lastName: 'Shmoseph',
  email: 'shmoseph.j@husky.neu.edu',
  emailId: 'shmoseph.j',
  role: RoleEnum.ADMIN,
  favoritedProjectsId: [],
  changeRequestsToReviewId: [],
  organizations: []
};

export const exampleLeadershipUser: User = {
  userId: '3',
  firstName: 'Joe',
  lastName: 'Blow',
  email: 'blow.j@husky.neu.edu',
  emailId: 'blow.j',
  role: RoleEnum.LEADERSHIP
};

export const exampleLeadUser: User = {
  userId: '4',
  firstName: 'Amy',
  lastName: 'Smith',
  email: 'smith.a@husky.neu.edu',
  emailId: 'smith.a',
  role: RoleEnum.HEAD
};

export const exampleManagerUser: User = {
  userId: '5',
  firstName: 'Rachel',
  lastName: 'Barmatha',
  email: 'barmatha.r@husky.neu.edu',
  emailId: 'barmatha.r',
  role: RoleEnum.MEMBER
};

export const exampleMemberUser: AuthenticatedUser = {
  userId: '6',
  firstName: 'Emily',
  lastName: 'Bendara',
  email: 'bendara.e@husky.neu.edu',
  emailId: 'bendara.e',
  role: RoleEnum.HEAD,
  favoritedProjectsId: [],
  changeRequestsToReviewId: [],
  organizations: []
};

export const exampleGuestUser: AuthenticatedUser = {
  userId: '7',
  firstName: 'Jackson',
  lastName: 'James',
  email: 'james.j@husky.neu.edu',
  emailId: 'james.j',
  role: RoleEnum.GUEST,
  favoritedProjectsId: [],
  changeRequestsToReviewId: [],
  organizations: []
};

export const exampleGuestUser2: User = {
  userId: '8',
  firstName: 'James',
  lastName: 'Jackson',
  email: 'jackson.j@husky.neu.edu',
  emailId: 'jackson.j',
  role: RoleEnum.GUEST
};

export const exampleAllUsers: User[] = [
  exampleAppAdminUser,
  exampleAdminUser,
  exampleLeadershipUser,
  exampleLeadUser,
  exampleManagerUser,
  exampleMemberUser,
  exampleGuestUser
];
