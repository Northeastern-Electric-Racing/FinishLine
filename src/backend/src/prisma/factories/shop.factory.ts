import { Prisma } from '@prisma/client';
import { connectUser } from '../utils/common.factory.js';
const connectOrganization = (organizationId: string) => ({ connect: { organizationId } });

type ShopConfig = {
  name: string;
  description: string;
};

type MachineryConfig = {
  name: string;
  shopName: string;
  quantity: number;
};

export const shopConfigs: ShopConfig[] = [
  { name: 'Forsyth Machine Shop', description: 'MIE Club Machine Shop' },
  { name: 'Richards 054', description: 'Main Richards Makerspace' },
  { name: 'Richards 055', description: 'Richards Basement Shop' },
  { name: 'Richards 050', description: 'THE BAYYYYYY WOOOO' }, // Fire description
  { name: 'EXP Machine Shop', description: 'Basement of EXP' }
];

export const machineryConfigs: MachineryConfig[] = [
  // Forsyth Machine Shop
  { name: 'Front Tormach 1100MX', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Middle Tormach 1100MX', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Rear Tormach 1100MX', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Right Tormach 1100MX', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Front Manual Mill', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Rear Manual Mill', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Front Manual Lathe', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'ProtoTRAK CNC Lathe', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Tormach 24R CNC Router', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Haas VF2 YT', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Cold Cut Saw', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Rear Manual Lathe', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Vertical Bandsaw', shopName: 'Forsyth Machine Shop', quantity: 1 },
  { name: 'Horizontal Bandsaw', shopName: 'Forsyth Machine Shop', quantity: 1 },

  // Richards 054
  { name: 'Hydraulic Press', shopName: 'Richards 054', quantity: 1 },
  { name: 'Arbor Press (Baja)', shopName: 'Richards 054', quantity: 1 },
  { name: 'Sheet Metal Brake', shopName: 'Richards 054', quantity: 1 },

  // Richards 055
  { name: 'Protomax Waterjet', shopName: 'Richards 055', quantity: 1 },
  { name: 'Drill Press', shopName: 'Richards 055', quantity: 1 },
  { name: 'Belt/Rotary Sander', shopName: 'Richards 055', quantity: 1 },
  { name: 'Bench Grinder', shopName: 'Richards 055', quantity: 2 },
  { name: 'Vertical Bandsaw', shopName: 'Richards 055', quantity: 1 },
  { name: 'Horizontal Bandsaw', shopName: 'Richards 055', quantity: 1 },

  // Richards 050
  { name: 'Bambu Lab P1P', shopName: 'Richards 050', quantity: 1 },
  { name: 'Bambu Lab H2S', shopName: 'Richards 050', quantity: 1 },

  // EXP Machine Shop
  { name: 'Tormach 1100MX', shopName: 'EXP Machine Shop', quantity: 1 },
  { name: 'Omax Waterjet', shopName: 'EXP Machine Shop', quantity: 1 }
];

export const shopCreateInput = (
  userCreatedId: string,
  organizationId: string,
  config: ShopConfig
): Prisma.ShopCreateInput => ({
  name: config.name,
  description: config.description,
  userCreated: connectUser(userCreatedId),
  organization: connectOrganization(organizationId)
});

export const machineryCreateInput = (
  userCreatedId: string,
  organizationId: string,
  config: MachineryConfig
): Prisma.MachineryCreateInput => ({
  name: config.name,
  userCreated: connectUser(userCreatedId),
  organization: connectOrganization(organizationId)
});

export const shopMachineryCreateInput = (
  shopId: string,
  machineryId: string,
  quantity: number
): Prisma.Shop_MachineryCreateInput => ({
  shop: { connect: { shopId } },
  machinery: { connect: { machineryId } },
  quantity
});
