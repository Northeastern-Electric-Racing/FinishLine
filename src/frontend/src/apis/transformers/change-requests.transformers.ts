/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  ChangeRequest,
  ChangeRequestTableRow,
  dbDateToLocalDate,
  ImplementedChange,
  ProjectProposedChanges,
  StandardChangeRequest,
  WorkPackageProposedChanges
} from 'shared';

/**
 * Transforms a change request to ensure deep field transformation of date objects.
 *
 * @param changeRequest Incoming change request object supplied by the HTTP response.
 * @returns Properly transformed change request object.
 */

const transformWorkPackageProposedChanges = (
  workPackageProposedChanges: WorkPackageProposedChanges
): WorkPackageProposedChanges => {
  return {
    ...workPackageProposedChanges,
    startDate: dbDateToLocalDate(new Date(workPackageProposedChanges.startDate))
  };
};

const transformProjectProposedChanges = (projectProposedChanges: ProjectProposedChanges): ProjectProposedChanges => {
  return {
    ...projectProposedChanges,
    workPackageProposedChanges: projectProposedChanges.workPackageProposedChanges.map(transformWorkPackageProposedChanges)
  };
};

export const changeRequestTableRowTransformer = (cr: ChangeRequestTableRow): ChangeRequestTableRow => ({
  ...cr,
  dateSubmitted: new Date(cr.dateSubmitted),
  dateReviewed: cr.dateReviewed ? new Date(cr.dateReviewed) : undefined,
  dateImplemented: cr.dateImplemented ? new Date(cr.dateImplemented) : undefined,
  startDate: cr.startDate ? dbDateToLocalDate(new Date(cr.startDate)) : undefined
});

export const changeRequestTransformer = (changeRequest: ChangeRequest | StandardChangeRequest): ChangeRequest => {
  const data: any = {
    ...changeRequest,
    implementedChanges: changeRequest.implementedChanges?.map(implementedChangeTransformer),
    dateSubmitted: new Date(changeRequest.dateSubmitted),
    dateReviewed: changeRequest.dateReviewed ? new Date(changeRequest.dateReviewed) : changeRequest.dateReviewed,
    dateImplemented: changeRequest.dateImplemented ? new Date(changeRequest.dateImplemented) : changeRequest.dateImplemented
  };
  if (data.startDate) {
    data.startDate = dbDateToLocalDate(new Date(data.startDate));
  }
  const output = data;

  if (output.workPackageProposedChanges) {
    output.workPackageProposedChanges = transformWorkPackageProposedChanges(output.workPackageProposedChanges);
  } else if (output.projectProposedChanges) {
    output.projectProposedChanges = transformProjectProposedChanges(output.projectProposedChanges);
  }
  return output;
};

/**
 * Transforms an implemented change to ensure deep field transformation of date objects.
 *
 * @param immplementedChange Incoming implemented change object supplied by the HTTP response.
 * @returns Properly transformed implemented change object.
 */
export const implementedChangeTransformer = (implementedChange: ImplementedChange): ImplementedChange => {
  return {
    ...implementedChange,
    dateImplemented: new Date(implementedChange.dateImplemented)
  } as ImplementedChange;
};
