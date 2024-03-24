import { Prisma } from '@prisma/client';

const workPackageTemplateQueryArgs = Prisma.validator<Prisma.Work_Package_TemplateArgs>()({
  include: {
    userCreated: true,
    userDeleted: true,
    blockedBy: true
  }
});

export default workPackageTemplateQueryArgs;
