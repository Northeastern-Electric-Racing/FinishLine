/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { TeamType, Team, User } from '../..';

export enum ChecklistItemType {
  TASK = 'TASK',
  INFO = 'INFO'
}

export interface Checklist {
  checklistId: string;
  content: string;
  teamType?: TeamType;
  team?: Team;
  isOptional: boolean;
  displayIndex?: number;
  itemType: ChecklistItemType;
  subtasks: ChecklistPreview[];
  parentChecklistId?: string;
  usersChecked: User[];
  userCreated: User;
  userDeleted?: User;
  dateCreated: Date;
  dateDeleted?: Date;
}

export type ChecklistPreview = Pick<
  Checklist,
  'checklistId' | 'content' | 'team' | 'teamType' | 'dateCreated' | 'isOptional' | 'displayIndex' | 'itemType'
>;

export type CreateChecklistPreview = Omit<ChecklistPreview, 'checklistId' | 'dateCreated'>;
