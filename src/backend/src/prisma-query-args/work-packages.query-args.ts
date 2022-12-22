import { Prisma } from '@prisma/client';
import { descBulletArgs } from '../utils/description-bullets.utils';

const wpQueryArgs = Prisma.validator<Prisma.Work_PackageArgs>()({
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

export default wpQueryArgs;
