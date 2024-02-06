import {
  Vendor as PrismaVendor,
  Reimbursement_Request as PrismaReimbursementRequest,
  Expense_Type as PrismaExpenseType,
  Reimbursement_Product as PrismaReimbursementProduct,
  Reimbursement_Status as PrismaReimbursementStatus,
  Reimbursement_Status_Type as PrismaReimbursementStatusType,
  Reimbursement_Product_Reason as PrismaReimbursementProductReason,
  Prisma,
  Club_Accounts,
  User
} from '@prisma/client';
import reimbursementRequestQueryArgs from '../../src/prisma-query-args/reimbursement-requests.query-args';
import { alfred, batman } from './users.test-data';
import { prismaWbsElement1 } from './wbs-element.test-data';
import { ClubAccount, Reimbursement, ReimbursementRequest } from 'shared';
import { wbsNumOf } from '../../src/utils/utils';
import userTransformer from '../../src/transformers/user.transformer';
import { vendorTransformer, expenseTypeTransformer } from '../../src/transformers/reimbursement-requests.transformer';

export const PopEyes: PrismaVendor = {
  vendorId: 'CHICKEN',
  dateCreated: new Date('12/22/203'),
  name: 'Pop Eyes',
  dateDeleted: null
};

export const KFC: PrismaVendor = {
  vendorId: 'CHICKEN',
  dateCreated: new Date('12/22/203'),
  name: 'kfc',
  dateDeleted: null
};

export const Parts: PrismaExpenseType = {
  expenseTypeId: 'PARTS',
  name: 'hammer',
  code: 12245,
  allowed: true,
  allowedRefundSources: [Club_Accounts.CASH, Club_Accounts.BUDGET],
  dateDeleted: null
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

export const prismaGiveMeMyMoney: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  receiptPictures: [],
  reimbursementStatuses: [{ ...examplePendingFinanceStatus, user: batman }],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [
    { ...GiveMeMoneyProduct, reimbursementProductReason: { ...GiveMeMoneyProductReason, wbsElement: prismaWbsElement1 } }
  ],
  expenseType: Parts
};

export const prismaReimbursementStatus: PrismaReimbursementStatus & { user: User } = {
  reimbursementStatusId: 1,
  type: 'SABO_SUBMITTED',
  userId: 0,
  dateCreated: new Date('20/8/2023'),
  reimbursementRequestId: '',
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

export const prismaReimbursementStatus3: PrismaReimbursementStatus & { user: User } = {
  reimbursementStatusId: 3,
  type: 'DENIED',
  userId: 0,
  dateCreated: new Date('23/8/2023'),
  reimbursementRequestId: GiveMeMyMoney.reimbursementRequestId,
  user: alfred
};

export const prismaReimbursementStatus4: PrismaReimbursementStatus & { user: User } = {
  reimbursementStatusId: 3,
  type: 'REIMBURSED',
  userId: 0,
  dateCreated: new Date('23/8/2023'),
  reimbursementRequestId: GiveMeMyMoney.reimbursementRequestId,
  user: alfred
};

export const prismaGiveMeMyMoney2: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  receiptPictures: [],
  reimbursementStatuses: [prismaReimbursementStatus],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [
    { ...GiveMeMoneyProduct, reimbursementProductReason: { ...GiveMeMoneyProductReason, wbsElement: prismaWbsElement1 } }
  ],
  expenseType: Parts
};

export const prismaGiveMeMyMoney3: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  receiptPictures: [],
  reimbursementStatuses: [prismaReimbursementStatus2],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [
    { ...GiveMeMoneyProduct, reimbursementProductReason: { ...GiveMeMoneyProductReason, wbsElement: prismaWbsElement1 } }
  ],
  expenseType: Parts
};

export const prismaGiveMeMyMoney4: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  receiptPictures: [],
  reimbursementStatuses: [prismaReimbursementStatus3],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [
    { ...GiveMeMoneyProduct, reimbursementProductReason: { ...GiveMeMoneyProductReason, wbsElement: prismaWbsElement1 } }
  ],
  expenseType: Parts
};

export const prismaGiveMeMyMoney5: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  receiptPictures: [],
  reimbursementStatuses: [prismaReimbursementStatus4],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [
    { ...GiveMeMoneyProduct, reimbursementProductReason: { ...GiveMeMoneyProductReason, wbsElement: prismaWbsElement1 } }
  ],
  expenseType: Parts
};

export const prismaGiveMeMyMoney3Approved: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs> = {
  ...GiveMeMyMoney,
  receiptPictures: [],
  reimbursementStatuses: [prismaReimbursementStatus2, prismaReimbursementStatus],
  recipient: batman,
  vendor: PopEyes,
  reimbursementProducts: [
    { ...GiveMeMoneyProduct, reimbursementProductReason: { ...GiveMeMoneyProductReason, wbsElement: prismaWbsElement1 } }
  ],
  expenseType: Parts
};

export const sharedGiveMeMyMoney: ReimbursementRequest = {
  reimbursementRequestId: GiveMeMyMoney.reimbursementRequestId,
  dateCreated: GiveMeMyMoney.dateCreated,
  dateOfExpense: GiveMeMyMoney.dateOfExpense,
  totalCost: GiveMeMyMoney.totalCost,
  receiptPictures: [],
  expenseType: expenseTypeTransformer(Parts),
  vendor: vendorTransformer(PopEyes),
  recipient: userTransformer(batman),
  saboId: undefined,
  dateDeleted: undefined,
  account: GiveMeMyMoney.account as ClubAccount,
  dateDelivered: undefined,
  reimbursementStatuses: [],
  reimbursementProducts: [
    {
      reimbursementProductReason: { wbsNum: wbsNumOf(prismaWbsElement1), wbsName: 'car' },
      dateDeleted: undefined,
      name: GiveMeMoneyProduct.name,
      cost: GiveMeMoneyProduct.cost,
      reimbursementProductId: GiveMeMoneyProduct.reimbursementProductId
    }
  ]
};

export const reimbursementMock = {
  reimbursementId: 'reimbursementMockId',
  purchaserId: batman.userId,
  amount: 12,
  dateCreated: new Date('2023-01-01'),
  userSubmitted: batman,
  userSubmittedId: batman.userId
};

export const updatedReimbursementMock = {
  ...reimbursementMock,
  amount: 17
};
