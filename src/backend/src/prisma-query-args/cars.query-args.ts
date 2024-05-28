import { Prisma } from '@prisma/client';
import { getAssemblyQueryArgs, getMaterialQueryArgs } from './bom.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';
import { getLinkQueryArgs } from './links.query-args';
import { getUserQueryArgs } from './user.query-args';

export type CarQueryArgs = ReturnType<typeof getCarQueryArgs>;

export const getCarQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.CarDefaultArgs>()({
    include: {
      wbsElement: {
        include: {
          lead: getUserQueryArgs(organizationId),
          descriptionBullets: getDescriptionBulletQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          links: getLinkQueryArgs(organizationId),
          changes: {
            where: { changeRequest: { dateDeleted: null } },
            include: { implementer: getUserQueryArgs(organizationId) }
          },
          materials: getMaterialQueryArgs(organizationId),
          assemblies: getAssemblyQueryArgs(organizationId)
        }
      }
    }
  });
