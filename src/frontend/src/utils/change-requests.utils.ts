/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { StandardChangeRequest } from 'shared';

export const hasProposedChanges = (cr: StandardChangeRequest) => {
  return cr.workPackageProposedChanges || cr.projectProposedChanges;
};
