import { Prisma } from '@prisma/client';

const reimbursementRequestQueryArgs = Prisma.validator<Prisma.reimbursementRequestArgs>()({
  include: {
    reimbursementRequestId: true,
    createdBy: true,
    deletedBy: true,
    assignees: true
  }
});

export default taskQueryArgs;
