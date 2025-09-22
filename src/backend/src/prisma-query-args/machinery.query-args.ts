import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type ShopQueryArgs = ReturnType<typeof getShopQueryArgs>;
export type ShopMachineryQueryArgs = ReturnType<typeof getShopMachineryQueryArgs>;
export type MachineryQueryArgs = ReturnType<typeof getMachineryQueryArgs>;

export const getShopQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ShopDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId)
    }
  });

export const getShopMachineryQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ShopMachineryDefaultArgs>()({
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
