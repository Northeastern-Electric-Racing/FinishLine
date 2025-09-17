import { Prisma } from '@prisma/client';
import { Machinery, Shop, ShopMachinery } from 'shared';
import { MachineryQueryArgs, ShopQueryArgs, ShopMachineryQueryArgs } from '../prisma-query-args/machinery.query-args';
import { userTransformer } from './user.transformer';

export const shopTransformer = (shop: Prisma.ShopGetPayload<ShopQueryArgs>): Shop => {
  return {
    shopId: shop.shopId,
    name: shop.name,
    description: shop.description,
    dateCreated: shop.dateCreated,
    userCreated: userTransformer(shop.userCreated)
  };
};

export const shopMachineryTransformer = (
  shopMachinery: Prisma.ShopMachineryGetPayload<ShopMachineryQueryArgs>
): ShopMachinery => {
  return {
    shop: shopTransformer(shopMachinery.shop),
    quantity: shopMachinery.quantity,
    description: shopMachinery.description ?? undefined
  };
};

export const machineryTransformer = (machinery: Prisma.MachineryGetPayload<MachineryQueryArgs>): Machinery => {
  return {
    machineryId: machinery.machineryId,
    name: machinery.name,
    shops: machinery.shops.map(shopMachineryTransformer),
    dateCreated: machinery.dateCreated,
    userCreated: userTransformer(machinery.userCreated)
  };
};
