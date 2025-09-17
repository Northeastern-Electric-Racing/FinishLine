import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type ShopQueryArgs = ReturnType<typeof getShopQueryArgs>;

export const getShopQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ShopDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
    },
  });
