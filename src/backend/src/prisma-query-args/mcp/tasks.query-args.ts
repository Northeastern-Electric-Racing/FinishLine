import { Prisma } from '@prisma/client';

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
      assignees: { select: { firstName: true, lastName: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      labels: { where: { dateDeleted: null }, select: { name: true } },
      // a task hangs off either the project's wbs element or one of its work packages'
      wbsElement: {
        select: { name: true, carNumber: true, projectNumber: true, workPackageNumber: true }
      }
    }
  });
