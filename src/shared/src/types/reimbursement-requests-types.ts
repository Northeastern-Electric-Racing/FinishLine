import { WbsNumber } from './project-types';
import { User } from './user-types';

export const ClubAccountConst = {
  Cash: 'CASH',
  Budget: 'BUDGET'
} as const;
export type ClubAccount = typeof ClubAccountConst[keyof typeof ClubAccountConst];

export const ReimbursementStatusTypeConst = {
  PendingFinance: 'PENDING FINANCE',
  SaboSubmitted: 'SABO SUBMITTED',
  AdvisorApproved: 'ADVISOR_APPROVED',
  Reimbursed: 'REIMBURSED'
} as const;
export type ReimbursementStatusType = typeof ReimbursementStatusTypeConst[keyof typeof ReimbursementStatusTypeConst];

export interface ReimbursementStatus {
  reimbursementStatusId: number;
  type: ReimbursementStatusType;
  user: User;
  dateCreated: Date;
  reimbursementRequest: ReimbursementRequestPreview;
}

export type ReimbursementStatusPreview = Pick<
  ReimbursementStatus,
  'reimbursementStatusId' | 'type' | 'user' | 'dateCreated'
>;

export interface ReimbursementRequest {
  reimbursementRequestId: string;
  saboId?: number;
  dateCreated: Date;
  dateDeleted?: Date;
  dateOfExpense: Date;
  reimbursementsStatuses: ReimbursementStatusPreview[];
  recepient: User;
  vendor: VendorPreview;
  account: ClubAccount;
  totalCost: number;
  receiptPictures: string[];
  reimbursementProducts: ReimbursementProductPreview[];
  dateDelivered?: Date;
  expenseType: ExpenseTypePreview;
}

export type ReimbursementRequestPreview = Pick<
  ReimbursementRequest,
  | 'reimbursementRequestId'
  | 'saboId'
  | 'dateCreated'
  | 'dateDeleted'
  | 'dateOfExpense'
  | 'recepient'
  | 'account'
  | 'totalCost'
  | 'receiptPictures'
  | 'dateDelivered'
>;

export interface ReimbursementProduct {
  reimbursementProductId: string;
  name: string;
  dateDeleted?: Date;
  cost: number;
  wbsNum: WbsNumber;
  reimbursementRequest: ReimbursementRequestPreview;
}

export type ReimbursementProductPreview = Pick<
  ReimbursementProduct,
  'reimbursementProductId' | 'name' | 'dateDeleted' | 'cost' | 'wbsNum'
>;

export interface VendorShared {
  vendorId: string;
  dateCreated: Date;
  name: string;
  requests: ReimbursementRequestPreview[];
}

export type VendorPreview = Pick<VendorShared, 'vendorId' | 'dateCreated' | 'name'>;

export interface ExpenseType {
  expenseTypeId: string;
  name: string;
  code: number;
  allowed: boolean;
  requests: ReimbursementRequestPreview[];
}

export type ExpenseTypePreview = Pick<ExpenseType, 'expenseTypeId' | 'name' | 'code' | 'allowed'>;
