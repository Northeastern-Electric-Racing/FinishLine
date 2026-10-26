import { Prisma } from '@prisma/client';
import { userSelect } from './teams.query-args.js';

export type McpWorkPackageQueryArgs = ReturnType<typeof getMcpWorkPackageQueryArgs>;

export const getMcpWorkPackageQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      startDate: true,
      duration: true,
      stage: true,
      orderInProject: true,
      // wbs numbers of the elements blocking this one, so the model can reason about ordering
      blockedBy: {
        where: { dateDeleted: null },
        select: { carNumber: true, projectNumber: true, workPackageNumber: true }
      },
      wbsElement: {
        select: {
          name: true,
          status: true,
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          lead: userSelect,
          manager: userSelect,
          // grouped by type name in the transformer; deliverables vs expected activities is
          // configurable per organization, so we never hardcode the type names here
          descriptionBullets: {
            where: { dateDeleted: null },
            select: { detail: true, descriptionBulletType: { select: { name: true } } }
          }
        }
      }
    }
  });
