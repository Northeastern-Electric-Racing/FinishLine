import { Expense_Type as PrismaExpenseType, Vendor as PrismaVendor } from '@prisma/client';

export const PopEyes: PrismaVendor = {
  vendorId: 'CHICKEN',
  dateCreated: new Date('12/22/203'),
  name: 'Pop Eyes'
};

export const Parts: PrismaExpenseType = {
  expenseTypeId: 'PARTS',
  name: 'hammer',
  code: 12245,
  allowed: true
};
