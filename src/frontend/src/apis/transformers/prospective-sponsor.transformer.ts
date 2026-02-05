/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ProspectiveSponsor } from 'shared';

/**
 * Transforms a prospective sponsor to ensure deep field transformation of date objects.
 *
 * @param prospectiveSponsor Incoming prospective sponsor object supplied by the HTTP response.
 * @returns Properly transformed prospective sponsor object.
 */
export const prospectiveSponsorTransformer = (prospectiveSponsor: ProspectiveSponsor): ProspectiveSponsor => {
  return {
    ...prospectiveSponsor,
    dateCreated: new Date(prospectiveSponsor.dateCreated),
    lastContactDate: new Date(prospectiveSponsor.lastContactDate),
    tasks: prospectiveSponsor.tasks.map((task) => ({
      ...task,
      dueDate: new Date(task.dueDate),
      notifyDate: task.notifyDate ? new Date(task.notifyDate) : undefined
    }))
  };
};
