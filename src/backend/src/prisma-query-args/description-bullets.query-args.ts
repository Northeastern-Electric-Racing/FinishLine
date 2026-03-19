import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';

export type DescriptionBulletQueryArgs = ReturnType<typeof getDescriptionBulletQueryArgs>;

export const getDescriptionBulletQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Description_BulletDefaultArgs>()({
    include: { userChecked: getUserQueryArgs(organizationId), descriptionBulletType: true }
  });
