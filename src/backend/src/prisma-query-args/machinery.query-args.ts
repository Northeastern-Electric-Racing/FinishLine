import { Prisma } from '@prisma/client';

export type ShopQueryArgs = ReturnType<typeof getShopQueryArgs>;
export type ShopMachineryQueryArgs = ReturnType<typeof getShopMachineryQueryArgs>;
export type MachineryQueryArgs = ReturnType<typeof getMachineryQueryArgs>;

export const getShopQueryArgs = () => Prisma.validator<Prisma.ShopDefaultArgs>()({});

export const getShopMachineryQueryArgs = () =>
  Prisma.validator<Prisma.ShopMachineryDefaultArgs>()({
    include: {
      shop: getShopQueryArgs()
    }
  });

export const getMachineryQueryArgs = () =>
  Prisma.validator<Prisma.MachineryDefaultArgs>()({
    include: {
      shops: getShopMachineryQueryArgs()
    }
  });
