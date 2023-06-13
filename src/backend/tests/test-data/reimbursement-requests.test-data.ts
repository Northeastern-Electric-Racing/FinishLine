import {
  Vendor as PrismaVendor,
  Reimbursement_Request as PrismaReimbursementRequest,
  Expense_Type as PrismaExpenseType,
  Reimbursement_Product as PrismaReimbursementProduct,
  Reimbursement_Status as PrismaReimbursementStatus,
  Club_Accounts,
  Prisma,
  User
} from '@prisma/client';
import reimbursementRequestQueryArgs from '../../src/prisma-query-args/reimbursement-requests.query-args';
import { alfred, batman } from './users.test-data';
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

export const prismaGiveMeMyMoney: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  reimbursementStatuses: [],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [{ ...GiveMeMoneyProduct, wbsElement: prismaWbsElement1 }],
  expenseType: Parts
};

export const prismaReimbursementStatus: PrismaReimbursementStatus & { user: User } = {
  reimbursementStatusId: 1,
  type: 'SABO_SUBMITTED',
  userId: 0,
  dateCreated: new Date('20/8/2023'),
  reimbursementRequestId: GiveMeMyMoney.reimbursementRequestId,
  user: alfred
};

export const prismaReimbursementStatus2: PrismaReimbursementStatus & { user: User } = {
  reimbursementStatusId: 2,
  type: 'PENDING_FINANCE',
  userId: 0,
  dateCreated: new Date('23/8/2023'),
  reimbursementRequestId: GiveMeMyMoney.reimbursementRequestId,
  user: alfred
};

export const prismaGiveMeMyMoney2: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  reimbursementStatuses: [prismaReimbursementStatus],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [{ ...GiveMeMoneyProduct, wbsElement: prismaWbsElement1 }],
  expenseType: Parts
};

export const prismaGiveMeMyMoney3: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  reimbursementStatuses: [prismaReimbursementStatus2],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [{ ...GiveMeMoneyProduct, wbsElement: prismaWbsElement1 }],
  expenseType: Parts
};
