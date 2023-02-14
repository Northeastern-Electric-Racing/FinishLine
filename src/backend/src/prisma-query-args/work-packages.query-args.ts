import { Prisma } from '@prisma/client';
import descriptionBulletQueryArgs from '../prisma-query-args/description-bullets.query-args';
import taskQueryArgs from './tasks.query-args';

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
        changes: { include: { implementer: true }, orderBy: { dateImplemented: 'asc' } },
        Task: { where: { deletedBy: null }, ...taskQueryArgs }
      }
    },
    expectedActivities: { where: { dateDeleted: null }, ...descriptionBulletQueryArgs },
    deliverables: { where: { dateDeleted: null }, ...descriptionBulletQueryArgs },
    dependencies: { where: { dateDeleted: null } }
  }
});

export default workPackageQueryArgs;
