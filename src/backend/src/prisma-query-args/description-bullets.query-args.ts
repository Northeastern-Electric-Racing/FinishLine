import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type DescriptionBulletQueryArgs = ReturnType<typeof getDescriptionBulletQueryArgs>;

export const getDescriptionBulletQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Description_BulletArgs>()({
    include: { userChecked: getUserQueryArgs(organizationId), descriptionBulletType: true }
  });
