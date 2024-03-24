import { Prisma } from '@prisma/client';

const blockedByInfoQueryArgs = Prisma.validator<Prisma.Work_Package_TemplateArgs>()({
  include: {
    : true
  }
});

export default blockedByInfoQueryArgs;
