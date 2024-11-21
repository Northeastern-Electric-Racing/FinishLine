/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { User } from './user-types';

export interface Checklist {
  checklistId: string;
  name: string;
  checklistItems: ChecklistItem[];
  teamTypeId: string | null;
}

export interface ChecklistItem {
  checklistItemId: string;
  name: string;
  subtasks: ChecklistItem[];
  description: string | null;
  parentChecklistItemId: string | null;
  usersChecked: User[];
  checklistId: string;
}
