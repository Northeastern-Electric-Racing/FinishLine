import { Prisma } from '@prisma/client';

const blockedByInfoQueryArgs = Prisma.validator<Prisma.Blocked_By_InfoArgs>()({
  include: {
    workPackageTemplate: true
  }
});

export default blockedByInfoQueryArgs;
