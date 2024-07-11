import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type ReimbursementQueryArgs = ReturnType<typeof getReimbursementQueryArgs>;

export const getReimbursementQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ReimbursementDefaultArgs>()({
    include: {
      userSubmitted: getUserQueryArgs(organizationId)
    }
  });
