import { Prisma } from '@prisma/client';
import descBulletArgs from '../prisma-query-args/description-bullets.query-args';

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
    expectedActivities: { where: { dateDeleted: null }, ...descBulletArgs },
    deliverables: { where: { dateDeleted: null }, ...descBulletArgs },
    dependencies: { where: { dateDeleted: null } }
  }
});

export default workPackageQueryArgs;
