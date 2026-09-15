import { Machinery, Shop, Shop_Machinery } from '@prisma/client';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import {
  machineryConfigs,
  machineryCreateInput,
  shopConfigs,
  shopCreateInput,
  shopMachineryCreateInput
} from '../factories/shop.factory.js';
import { SeedProcess } from '../processes/seed-process.js';

type ShopInput = OrganizationOutput & UsersOutput;

export type ShopOutput = {
  shops: Shop[];
  machinery: Machinery[];
  shopMachinery: Shop_Machinery[];
};

export class ShopProcess extends SeedProcess<ShopInput, ShopOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess];
  }

  async run({ organization, appAdmins }: ShopInput): Promise<ShopOutput> {
    const { organizationId } = organization;
    const [creator] = appAdmins;

    if (!creator) throw new Error('ShopProcess requires at least one app admin user.');

    const shops = await Promise.all(
      shopConfigs.map((config) =>
        this.prisma.shop.create({
          data: shopCreateInput(creator.userId, organizationId, config)
        })
      )
    );

    const shopIdsByName = shops.reduce<Record<string, string>>((acc, shop) => {
      acc[shop.name] = shop.shopId;
      return acc;
    }, {});

    const machinery = await Promise.all(
      machineryConfigs.map((config) =>
        this.prisma.machinery.create({
          data: machineryCreateInput(creator.userId, organizationId, config)
        })
      )
    );

    const shopMachinery = await Promise.all(
      machineryConfigs.map((config, i) => {
        const shopId = shopIdsByName[config.shopName];
        if (!shopId) throw new Error(`Missing shop for machinery: ${config.shopName}`);
        return this.prisma.shop_Machinery.create({
          data: shopMachineryCreateInput(shopId, machinery[i].machineryId, config.quantity)
        });
      })
    );

    return { shops, machinery, shopMachinery };
  }
}
