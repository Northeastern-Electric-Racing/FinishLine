import { WbsNumber } from './project-types';
import { User } from './user-types';

export enum Club_Account {
  CASH = 'CASH',
  BUDGET = 'BUDGET'
}

export enum Reimbursement_Status_Type_Shared {
  PENDING_FINANCE = 'PENDING_FINANCE',
  SABO_SUBMITTED = 'SABO_SUBMITTED',
  ADVISOR_APPROVED = 'ADVISOR_APPROVED',
  REIMBURSED = 'REIMBURSED'
}

export interface ReimbursementStatus {
  reimbursementStatusId: number;
  type: Reimbursement_Status_Type_Shared;
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
  account: Club_Account;
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
