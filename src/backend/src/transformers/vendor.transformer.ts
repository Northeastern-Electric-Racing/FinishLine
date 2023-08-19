import { Prisma } from '@prisma/client';
import { Vendor } from 'shared';

const vendorTransformer = (vendor: Prisma.VendorGetPayload<null>): Vendor => {
  return {
    vendorId: vendor.vendorId,
    dateCreated: vendor.dateCreated,
    name: vendor.name
  };
};

export default vendorTransformer;
