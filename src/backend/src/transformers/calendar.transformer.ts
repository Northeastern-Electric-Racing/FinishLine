import { Prisma } from '@prisma/client';
import { Machinery, Shop, ShopMachinery } from 'shared';
import { MachineryQueryArgs, ShopQueryArgs, ShopMachineryQueryArgs } from '../prisma-query-args/machinery.query-args';

export const shopTransformer = (shop: Prisma.ShopGetPayload<ShopQueryArgs>): Shop => {
  return {
    name: shop.name,
    description: shop.description
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
    name: machinery.name,
    shops: machinery.shops.map(shopMachineryTransformer)
  };
};
