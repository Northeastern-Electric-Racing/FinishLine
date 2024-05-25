/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AuthenticatedUser, User } from 'shared';

/**
 * Transforms a user to ensure deep field transformation of date objects.
 *
 * @param user Incoming user object supplied by the HTTP response.
 * @returns Properly transformed user object.
 */
export const userTransformer = (user: User): User => {
  return {
    ...user
  };
};

/**
 * Transforms a authenticated user to ensure deep field transformation of date objects.
 *
 * @param authUser Incoming authenticated user object supplied by the HTTP response.
 * @returns Properly transformed user object.
 */
export const authUserTransformer = (authUser: AuthenticatedUser): AuthenticatedUser => {
  return {
    ...authUser
  };
};
