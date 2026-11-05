import { Prisma } from '@prisma/client';
import { getBaseUserQueryArgs, getUserQueryArgs } from './user.query-args.js';

export type BaseDescriptionBulletQueryArgs = ReturnType<typeof getBaseDescriptionBulletQueryArgs>;
/** @deprecated Use BaseDescriptionBulletQueryArgs. Still used by projects, change requests, and wbs templates until they are refactored */
export type DescriptionBulletQueryArgs = ReturnType<typeof getDescriptionBulletQueryArgs>;

// everything a checklist or diff reads off a bullet, including who checked it off
export const getBaseDescriptionBulletQueryArgs = () =>
  Prisma.validator<Prisma.Description_BulletDefaultArgs>()({
    select: {
      descriptionId: true,
      detail: true,
      dateAdded: true,
      dateDeleted: true,
      dateTimeChecked: true,
      descriptionBulletType: { select: { name: true } },
      userChecked: getBaseUserQueryArgs()
    }
  });

/** @deprecated Use getBaseDescriptionBulletQueryArgs. Still used by projects, change requests, and wbs templates until they are refactored */
export const getDescriptionBulletQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Description_BulletDefaultArgs>()({
    select: {
      descriptionId: true,
      detail: true,
      dateAdded: true,
      dateDeleted: true,
      dateTimeChecked: true,
      descriptionBulletType: { select: { name: true } },
      userChecked: getUserQueryArgs(organizationId)
    }
  });
