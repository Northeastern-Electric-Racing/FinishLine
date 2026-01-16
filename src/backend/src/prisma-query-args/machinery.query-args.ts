import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';
import { getShopQueryArgs } from './shop.query-args.js';

export type ShopMachineryQueryArgs = ReturnType<typeof getShopMachineryQueryArgs>;
export type MachineryQueryArgs = ReturnType<typeof getMachineryQueryArgs>;

export const getShopMachineryQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Shop_MachineryDefaultArgs>()({
    include: {
      shop: getShopQueryArgs(organizationId)
    }
  });

export const getMachineryQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.MachineryDefaultArgs>()({
    include: {
      shops: getShopMachineryQueryArgs(organizationId),
      userCreated: getUserQueryArgs(organizationId)
    }
  });
