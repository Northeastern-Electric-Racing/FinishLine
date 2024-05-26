/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { RoleEnum, AuthenticatedUser } from 'shared';

export const exampleAuthenticatedAdminUser: AuthenticatedUser = {
  userId: "2",
  firstName: 'Joe',
  lastName: 'Shmoe',
  email: 'shmoe.j@husky.neu.edu',
  emailId: 'shmoe.j',
  role: RoleEnum.ADMIN,
  favoritedProjectsId: [],
  changeRequestsToReviewId: [],
  organizations: []
};
