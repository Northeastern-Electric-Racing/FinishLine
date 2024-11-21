import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type ChecklistQueryArgs = ReturnType<typeof getChecklistQueryArgs>;
export type ChecklistItemQueryArgs = ReturnType<typeof getChecklistItemQueryArgs>;

const getChecklistQueryArgs = (organizationId: string) => {
  return Prisma.validator<Prisma.ChecklistDefaultArgs>()({
    include: {
      checklistItems: getChecklistItemQueryArgs(organizationId)
    }
  });
};

const getChecklistItemQueryArgs = (organizationId: string) => {
  return Prisma.validator<Prisma.ChecklistItemDefaultArgs>()({
    include: {
      usersChecked: getUserQueryArgs(organizationId),
      subtasks: true,
      organization: true
    }
  });
};
