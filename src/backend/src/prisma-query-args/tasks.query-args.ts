import { Prisma } from '@prisma/client';

const taskQueryArgs = Prisma.validator<Prisma.TaskArgs>()({
  include: {
    wbsElement: true,
    createdBy: true,
    deletedBy: true,
    assignees: true
  }
});

export default taskQueryArgs;
