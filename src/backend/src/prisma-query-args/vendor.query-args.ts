import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type VendorQueryArgs = ReturnType<typeof getVendorQueryArgs>;

export const getVendorQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.VendorDefaultArgs>()({
    include: {
      twoFactorContacts: getUserQueryArgs(organizationId),
      addedBy: getUserQueryArgs(organizationId)
    }
  });
