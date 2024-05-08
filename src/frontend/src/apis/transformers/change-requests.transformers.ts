/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ChangeRequest, ImplementedChange, StandardChangeRequest } from 'shared';

/**
 * Transforms a change request to ensure deep field transformation of date objects.
 *
 * @param changeRequest Incoming change request object supplied by the HTTP response.
 * @returns Properly transformed change request object.
 */

interface MaybeActiveChangeRequest extends ChangeRequest {
  startDate?: Date;
}

export const changeRequestTransformer = (changeRequest: ChangeRequest | StandardChangeRequest) => {
  const data: MaybeActiveChangeRequest = {
    ...changeRequest,
    implementedChanges: changeRequest.implementedChanges?.map(implementedChangeTransformer),
    dateSubmitted: new Date(changeRequest.dateSubmitted),
    dateReviewed: changeRequest.dateReviewed ? new Date(changeRequest.dateReviewed) : changeRequest.dateReviewed,
    dateImplemented: changeRequest.dateImplemented ? new Date(changeRequest.dateImplemented) : changeRequest.dateImplemented
  };
  if (data.startDate) {
    data.startDate = new Date(data.startDate);
  }
  const output: ChangeRequest = data;

  const workPackageProposedChanges = (changeRequest as StandardChangeRequest).workPackageProposedChanges;
  if (workPackageProposedChanges && workPackageProposedChanges.startDate) {
    console.log('hello');
    const scopeOutput = {
      ...data,
      workPackageProposedChanges: { ...workPackageProposedChanges },
      startDate: new Date(workPackageProposedChanges.startDate)
    };
    return scopeOutput;
  }
  return output;
};

/**
 * Transforms an implemented change to ensure deep field transformation of date objects.
 *
 * @param immplementedChange Incoming implemented change object supplied by the HTTP response.
 * @returns Properly transformed implemented change object.
 */
export const implementedChangeTransformer = (implementedChange: ImplementedChange) => {
  return {
    ...implementedChange,
    dateImplemented: new Date(implementedChange.dateImplemented)
  } as ImplementedChange;
};
