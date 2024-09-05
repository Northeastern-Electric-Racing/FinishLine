/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TeamType } from './design-review-types';
import { User } from './user-types';

export interface Checklist {
  checklistId: string;
  subtasks: string[];
  description: string;
  teamType: TeamType;
  userCreated: User;
  userDeleted?: User;
  dateCreated: Date;
  dateDeleted?: Date;
}
