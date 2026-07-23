import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';

export type DescriptionBulletQueryArgs = ReturnType<typeof getDescriptionBulletQueryArgs>;

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
