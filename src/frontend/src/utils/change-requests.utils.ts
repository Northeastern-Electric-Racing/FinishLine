import { ChangeRequest, StandardChangeRequest } from 'shared';

export const canReviewChangeRequest = (cr: ChangeRequest, selected: number) => {
  return (
    selected > -1 ||
    (cr as StandardChangeRequest).workPackageProposedChanges ||
    (cr as StandardChangeRequest).projectProposedChanges
  );
};
