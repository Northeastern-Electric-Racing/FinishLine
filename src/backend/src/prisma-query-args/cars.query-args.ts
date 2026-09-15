import { Prisma } from '@prisma/client';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args.js';
import { getLinkQueryArgs } from './links.query-args.js';
import { getUserQueryArgs } from './user.query-args.js';

export type CarQueryArgs = ReturnType<typeof getCarQueryArgs>;

export const getCarQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.CarDefaultArgs>()({
    include: {
      wbsElement: {
        include: {
          lead: getUserQueryArgs(organizationId),
          descriptionBullets: getDescriptionBulletQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          links: getLinkQueryArgs(),
          changes: {
            where: { changeRequest: { dateDeleted: null } },
            include: { implementer: getUserQueryArgs(organizationId) }
          }
        }
      }
    }
  });
