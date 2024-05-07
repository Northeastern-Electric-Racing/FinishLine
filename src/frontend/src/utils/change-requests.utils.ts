import { StandardChangeRequest } from 'shared';

export const hasProposedChanges = (cr: StandardChangeRequest) => {
  return cr.workPackageProposedChanges || cr.projectProposedChanges;
};
