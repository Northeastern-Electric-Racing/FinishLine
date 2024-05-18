import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type ReceiptQueryArgs = ReturnType<typeof getReceiptQueryArgs>;

export const getReceiptQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ReceiptArgs>()({
    include: {
      deletedBy: getUserQueryArgs(organizationId)
    }
  });
