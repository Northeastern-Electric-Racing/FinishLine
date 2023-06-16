import {
  Vendor as PrismaVendor,
  Reimbursement_Request as PrismaReimbursementRequest,
  Expense_Type as PrismaExpenseType,
  Reimbursement_Product as PrismaReimbursementProduct,
  Reimbursement_Status as PrismaReimbursementStatus,
  Reimbursement_Status_Type as PrismaReimbursementStatusType,
  Prisma,
  Club_Accounts
} from '@prisma/client';
import { batman } from './users.test-data';
import { prismaWbsElement1 } from './wbs-element.test-data';
import reimbursementRequestQueryArgs from '../../src/prisma-query-args/reimbursement-requests.query-args';
import { ClubAccount, ReimbursementRequest } from 'shared';
import { wbsNumOf } from '../../src/utils/utils';
import userTransformer from '../../src/transformers/user.transformer';
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

export const Status: PrismaReimbursementStatus = {
  reimbursementStatusId: 1,
  type: PrismaReimbursementStatusType.SABO_SUBMITTED,
  userId: 2,
  dateCreated: new Date(),
  reimbursementRequestId: 'id'
};

export const prismaGiveMeMyMoney: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  reimbursementsStatuses: [],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [{ ...GiveMeMoneyProduct, wbsElement: prismaWbsElement1 }],
  expenseType: Parts
};

export const sharedGiveMeMyMoney: ReimbursementRequest = {
  reimbursementRequestId: GiveMeMyMoney.reimbursementRequestId,
  dateCreated: GiveMeMyMoney.dateCreated,
  dateOfExpense: GiveMeMyMoney.dateOfExpense,
  totalCost: GiveMeMyMoney.totalCost,
  receiptPictures: GiveMeMyMoney.receiptPictures,
  expenseType: Parts,
  vendor: PopEyes,
  recipient: userTransformer(batman),
  saboId: undefined,
  dateDeleted: undefined,
  account: GiveMeMyMoney.account as ClubAccount,
  dateDelivered: undefined,
  reimbursementsStatuses: [],
  reimbursementProducts: [
    {
      wbsNum: wbsNumOf(prismaWbsElement1),
      wbsName: 'car',
      dateDeleted: undefined,
      name: GiveMeMoneyProduct.name,
      cost: GiveMeMoneyProduct.cost,
      reimbursementProductId: GiveMeMoneyProduct.reimbursementProductId
    }
  ]
};
