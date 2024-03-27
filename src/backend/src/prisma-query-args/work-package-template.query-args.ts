import { Prisma } from '@prisma/client';

export const workPackageTemplateQueryArgs = Prisma.validator<Prisma.Work_Package_TemplateArgs>()({
  include: {
    userCreated: true,
    userDeleted: true,
    blockedBy: true
  }
});
