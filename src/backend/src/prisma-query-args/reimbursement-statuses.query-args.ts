import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type ReimbursementStatusQueryArgs = ReturnType<typeof getReimbursementStatusQueryArgs>;

export const getReimbursementStatusQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_StatusDefaultArgs>()({
    include: {
      user: getUserQueryArgs(organizationId)
    }
  });
