import { Prisma } from '@prisma/client';

const receiptQueryArgs = Prisma.validator<Prisma.ReceiptArgs>()({
  include: {
    deletedBy: true
  }
});

export default receiptQueryArgs;
