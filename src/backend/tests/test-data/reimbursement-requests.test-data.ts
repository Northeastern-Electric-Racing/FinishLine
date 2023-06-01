import {
  Vendor as PrismaVendor,
  Reimbursement_Request as PrismaReimbursementRequest,
  Expense_Type as PrismaExpenseType,
  Reimbursement_Product as PrismaReimbursementProduct,
  Reimbursement_Request
} from '@prisma/client';
import { Club_Account } from 'shared';
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

export const GiveMeMyMoney: PrismaReimbursementRequest = {
  reimbursementRequestId: '',
  saboId: null,
  dateCreated: new Date('20/8/2023'),
  dateDeleted: null,
  dateOfExpense: new Date('18/8/2023'),
  recipientId: 1,
  vendorId: '',
  account: Club_Account.CASH,
  totalCost: 0,
  receiptPictures: [],
  dateDelivered: null,
  expenseTypeId: ''
};

export const GiveMeMoneyProduct: PrismaReimbursementProduct = {
  reimbursementProductId: '1',
  reimbursementRequestId: '',
  name: 'test',
  cost: 0,
  dateDeleted: null,
  wbsElementId: 1
};

export const requestDeliveredValid: Reimbursement_Request = {
  reimbursementRequestId: '12345',
  saboId: null,
  dateCreated: new Date('12/22/203'),
  dateDeleted: null,
  dateOfExpense: new Date('12/07/203'),
  recipientId: 343,
  vendorId: 'CHICKEN',
  account: Club_Account.CASH,
  totalCost: 343,
  receiptPictures: [],
  dateDelivered: null,
  expenseTypeId: 'PARTS'
};
