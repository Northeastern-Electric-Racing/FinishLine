import {
  Vendor as PrismaVendor,
  Reimbursement_Request as PrismaReimbursementRequest,
  Expense_Type as PrismaExpenseType,
  Reimbursement_Product as PrismaReimbursementProduct,
  Reimbursement_Status as PrismaReimbursementStatus,
  Reimbursement_Status_Type as PrismaReimbursementStatusType,
  Reimbursement_Product_Reason as PrismaReimbursementProductReason,
  Club_Accounts
} from '@prisma/client';
import { batman } from './users.test-data';

export const PopEyes: PrismaVendor = {
  vendorId: 'CHICKEN',
  dateCreated: new Date('12/22/203'),
  name: 'Pop Eyes'
};

export const Parts: PrismaExpenseType = {
  expenseTypeId: 'PARTS',
  name: 'hammer',
  code: 12245,
  allowed: true,
  allowedRefundSources: [Club_Accounts.CASH, Club_Accounts.BUDGET]
};

export const GiveMeMyMoney: PrismaReimbursementRequest = {
  reimbursementRequestId: '',
  saboId: null,
  dateCreated: new Date('20/8/2023'),
  dateDeleted: null,
  dateOfExpense: new Date('18/8/2023'),
  recipientId: 1,
  vendorId: '',
  account: Club_Accounts.CASH,
  totalCost: 0,
  dateDelivered: null,
  expenseTypeId: ''
};

export const GiveMeMyMoney2: PrismaReimbursementRequest = {
  reimbursementRequestId: '',
  saboId: null,
  dateCreated: new Date('20/8/2023'),
  dateDeleted: new Date('25/8/2023'),
  dateOfExpense: new Date('18/8/2023'),
  recipientId: 1,
  vendorId: '',
  account: Club_Accounts.CASH,
  totalCost: 0,
  dateDelivered: null,
  expenseTypeId: ''
};

export const GiveMeMoneyProduct: PrismaReimbursementProduct = {
  reimbursementProductId: '1',
  reimbursementRequestId: '',
  name: 'test',
  cost: 0,
  dateDeleted: null,
  reimbursementProductReasonId: '1'
};

export const GiveMeMoneyProductReason: PrismaReimbursementProductReason = {
  reimbursementProductReasonId: '1',
  wbsElementId: 1,
  otherReason: null
};

export const exampleSaboSubmittedStatus: PrismaReimbursementStatus = {
  reimbursementStatusId: 1,
  type: PrismaReimbursementStatusType.SABO_SUBMITTED,
  userId: 2,
  dateCreated: new Date(),
  reimbursementRequestId: 'id'
};

export const examplePendingFinanceStatus: PrismaReimbursementStatus = {
  reimbursementStatusId: 1,
  type: PrismaReimbursementStatusType.PENDING_FINANCE,
  userId: batman.userId,
  dateCreated: new Date('2023-08-20T08:00:00Z'),
  reimbursementRequestId: ''
};
