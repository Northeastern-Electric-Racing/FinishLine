import { Prisma } from '@prisma/client';
import { userSelect } from './teams.query-args.js';

export type McpTaskQueryArgs = ReturnType<typeof getMcpTaskQueryArgs>;

export const getMcpTaskQueryArgs = () =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    select: {
      taskId: true,
      title: true,
      notes: true,
      status: true,
      priority: true,
      startDate: true,
      deadline: true,
      assignees: userSelect,
      createdBy: userSelect,
      labels: { where: { dateDeleted: null }, select: { name: true } },
      // a task hangs off either the project's wbs element or one of its work packages'
      wbsElement: {
        select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true }
      }
    }
  });
