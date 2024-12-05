/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TeamType } from './design-review-types';
import { Team } from './team-types';
import { User } from './user-types';

export interface Checklist {
  checklistId: string;
  name: string;
  teamType?: TeamType;
  team?: Team;
  descriptions: string[];
  isOptional: boolean;
  subtasks: Checklist[];
  parentChecklist?: Checklist;
  usersChecked: User[];
  userCreated: User;
  userDeleted?: User;
  dateCreated: Date;
  dateDeleted?: Date;
}
