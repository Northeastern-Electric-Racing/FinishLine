import { Club_Accounts, Expense_Type as PrismaExpenseType, Vendor as PrismaVendor, Reimbursement_Request } from '@prisma/client';

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

export const requestDeliveredValid: Reimbursement_Request = {
  reimbursementRequestId: '12345',
  saboId: null,
  dateCreated: new Date('12/22/203'),
  dateDeleted: null,
  dateOfExpense: new Date('12/07/203'),
  recepientId: 343,
  vendorId: 'CHICKEN',
  account: Club_Accounts,
  totalCost: 343,
  receiptPictures: [],
  dateDelivered: null,
  expenseTypeId: 'PARTS'
};
