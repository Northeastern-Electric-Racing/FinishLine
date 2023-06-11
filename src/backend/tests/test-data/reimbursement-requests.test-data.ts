import {
  Vendor as PrismaVendor,
  Reimbursement_Request as PrismaReimbursementRequest,
  Expense_Type as PrismaExpenseType,
  Reimbursement_Product as PrismaReimbursementProduct,
  Club_Accounts,
  Prisma,
  Reimbursement_Status,
  Reimbursement_Status_Type
} from '@prisma/client';
import reimbursementRequestQueryArgs from '../../src/prisma-query-args/reimbursement-requests.query-args';
import { batman } from './users.test-data';
import { prismaWbsElement1 } from './wbs-element.test-data';

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
  account: Club_Accounts.CASH,
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

export const examplePendingFinanceStatus: Reimbursement_Status = {
  reimbursementStatusId: 1,
  type: Reimbursement_Status_Type.PENDING_FINANCE,
  userId: batman.userId,
  dateCreated: new Date('2023-08-20T08:00:00Z'),
  reimbursementRequestId: ''
};

export const prismaGiveMeMyMoney: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  reimbursementsStatuses: [{ ...examplePendingFinanceStatus, user: batman }],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [{ ...GiveMeMoneyProduct, wbsElement: prismaWbsElement1 }],
  expenseType: Parts
};
