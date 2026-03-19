/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { AuthenticatedUser, Availability, User, UserScheduleSettings, UserWithScheduleSettings } from 'shared';

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

/**
 * Transforms the user schedule settings to ensure deep field transformation of date objects.
 *
 * @param settings The user schedule settings to transform
 * @returns The transformed user schedule settings
 */
export const userScheduleSettingsTransformer = (settings: UserScheduleSettings): UserScheduleSettings => {
  return {
    ...settings,
    availabilities: settings.availabilities.map(availabilityTransformer)
  };
};

/**
 * Transforms a user to ensure deep field transformation of date objects.
 *
 * @param user The user to transform
 * @returns The transformed user
 */
export const userWithScheduleSettingsTransformer = (user: UserWithScheduleSettings): UserWithScheduleSettings => {
  return {
    ...user,
    scheduleSettings: user.scheduleSettings ? userScheduleSettingsTransformer(user.scheduleSettings) : undefined
  };
};

/**
 * Transforms an availability to ensure deep field transformation of date objects.
 *
 * @param availability the availability to transform
 * @returns the transformed availability
 */
export const availabilityTransformer = (availability: Availability): Availability => {
  return {
    ...availability,
    dateSet: new Date(availability.dateSet)
  };
};
