import { Prisma } from '@prisma/client';

const reimbursementStatusQueryArgs = Prisma.validator<Prisma.Reimbursement_StatusArgs>()({
  include: {
    user: true
  }
});

export default reimbursementStatusQueryArgs;
