/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TeamType } from './design-review-types';
import { Team } from './team-types';
import { User } from './user-types';

export enum ChecklistItemType {
  TASK = 'TASK',
  INFO = 'INFO'
}

export interface Checklist {
  checklistId: string;
  name: string;
  teamType?: TeamType;
  team?: Team;
  descriptions: string[];
  isOptional: boolean;
  displayOrder?: number;
  itemType: ChecklistItemType;
  subtasks: ChecklistPreview[];
  parentChecklistId?: string;
  usersChecked: User[];
  userCreated: User;
  userDeleted?: User;
  dateCreated: Date;
  dateDeleted?: Date;
}

export type ChecklistPreview = Pick<Checklist, 'checklistId' | 'name' | 'team' | 'teamType' | 'dateCreated' | 'isOptional' | 'displayOrder' | 'itemType'>;

export type CreateChecklistPreview = Omit<ChecklistPreview, 'checklistId' | 'dateCreated'>;
