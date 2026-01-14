import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';

export type TaskQueryArgs = ReturnType<typeof getTaskQueryArgs>;
export type TaskPreviewQueryArgs = ReturnType<typeof getTaskPreviewQueryArgs>;

export const getTaskQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    include: {
      wbsElement: true,
      createdBy: getUserQueryArgs(organizationId),
      deletedBy: getUserQueryArgs(organizationId),
      assignees: getUserQueryArgs(organizationId)
    }
  });

export const getTaskPreviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    include: {
      wbsElement: true,
      createdBy: getUserQueryArgs(organizationId),
      assignees: getUserQueryArgs(organizationId)
    }
  });
