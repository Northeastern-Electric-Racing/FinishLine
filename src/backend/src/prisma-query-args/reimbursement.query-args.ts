import { Prisma } from '@prisma/client';

const reimbursementQueryArgs = Prisma.validator<Prisma.ReimbursementArgs>()({
  include: {
    userSubmitted: true
  }
});

export default reimbursementQueryArgs;
