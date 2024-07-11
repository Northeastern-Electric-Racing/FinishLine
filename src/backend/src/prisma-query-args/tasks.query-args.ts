import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type TaskQueryArgs = ReturnType<typeof getTaskQueryArgs>;

export const getTaskQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    include: {
      wbsElement: true,
      createdBy: getUserQueryArgs(organizationId),
      deletedBy: getUserQueryArgs(organizationId),
      assignees: getUserQueryArgs(organizationId)
    }
  });
