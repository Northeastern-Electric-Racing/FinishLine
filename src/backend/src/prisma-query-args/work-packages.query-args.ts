import { Prisma } from '@prisma/client';
import { descBulletArgs } from '../prisma-query-args/description-bullets.query-args';

const workPackageQueryArgs = Prisma.validator<Prisma.Work_PackageArgs>()({
  include: {
    project: {
      include: {
        wbsElement: true
      }
    },
    wbsElement: {
      include: {
        projectLead: true,
        projectManager: true,
        changes: { include: { implementer: true }, orderBy: { dateImplemented: 'asc' } }
      }
    },
    expectedActivities: descBulletArgs,
    deliverables: descBulletArgs,
    dependencies: true
  }
});

export default workPackageQueryArgs;
