import { Prisma } from '@prisma/client';
import { getUserQueryArgs, UserQueryArgs } from './user.query-args';

export type ChecklistQueryArgs = ReturnType<typeof getChecklistQueryArgs>;
export type ChecklistItemQueryArgs = {
  include: {
    usersChecked: UserQueryArgs;
    subtasks: ChecklistItemQueryArgs;
    organization: true;
  };
};

const getChecklistQueryArgs = (organizationId: string) => {
  return Prisma.validator<Prisma.ChecklistDefaultArgs>()({
    include: {
      checklistItems: getChecklistItemQueryArgs(organizationId)
    }
  });
};

const getChecklistItemQueryArgs = (organizationId: string): ChecklistItemQueryArgs => {
  return Prisma.validator<Prisma.ChecklistItemDefaultArgs>()({
    include: {
      usersChecked: getUserQueryArgs(organizationId),
      subtasks: getChecklistItemQueryArgs(organizationId),
      organization: true
    }
  });
};
