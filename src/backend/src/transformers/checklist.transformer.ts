import { Prisma } from '@prisma/client';
import { ChecklistItemQueryArgs, ChecklistQueryArgs } from '../prisma-query-args/checklist.query-args';
import { Checklist, ChecklistItem } from 'shared';
import { userTransformer } from './user.transformer';

export const checklistTransformer = (checklist: Prisma.ChecklistGetPayload<ChecklistQueryArgs>): Checklist => {
  return {
    checklistId: checklist.checklistId,
    name: checklist.name,
    teamTypeId: checklist.teamTypeId,
    checklistItems: checklist.checklistItems.map((checklistItem) => checklistItemTransformer(checklistItem))
  };
};

export const checklistItemTransformer = (
  checklistItem: Prisma.ChecklistItemGetPayload<ChecklistItemQueryArgs>
): ChecklistItem => {
  return {
    checklistItemId: checklistItem.checklistItemId,
    checklistId: checklistItem.checklistId,
    name: checklistItem.name,
    description: checklistItem.description,
    parentChecklistItemId: checklistItem.parentChecklistItemId,
    usersChecked: checklistItem.usersChecked.map((user) => userTransformer(user)),
    subtasks: checklistItem.subtasks.map((subtask) => checklistItemTransformer(subtask))
  };
};
