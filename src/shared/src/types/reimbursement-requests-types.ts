import { UserPreview } from './user-types';
import { WbsNumber } from './project-types';

export enum Club_Account {
  CASH = 'CASH',
  BUDGET = 'BUDGET'
}

export enum ReimbursementStatusType {
  PENDING_FINANCE = 'PENDING FINANCE',
  SABO_SUBMITTED = 'SABO SUBMITTED',
  ADVISOR_APPROVED = 'ADVISOR_APPROVED',
  REIMBURSED = 'REIMBURSED'
}

export interface ReimbursementStatus {
  reimbursementStatusId: number;
  type: ReimbursementStatusType;
  user: UserPreview;
  dateCreated: Date;
  reimbursementRequest: ReimbursementRequest;
}

export interface ReimbursementRequest {
  reimbursementRequestId: string;
  saboId?: number;
  dateCreated: Date;
  dateDeleted?: Date;
  dateOfExpense: Date;
  reimbursementsStatuses: ReimbursementStatus[];
  recepient: UserPreview;
  vendor: VendorShared;
  account: Club_Account;
  totalCost: number;
  receiptPictures: string[];
  reimbursementProducts: ReimbursementProduct[];
  dateDelivered?: Date;
  expenseType: ExpenseType;
}

export interface ReimbursementProduct {
  reimbursementProductId: string;
  name: string;
  dateDeleted?: Date;
  cost: number;
  wbsNum: WbsNumber;
  reimbursementRequest: ReimbursementRequest;
}

export interface VendorShared {
  vendorId: string;
  dateCreated: Date;
  name: string;
  requests: ReimbursementRequest[];
}

export interface ExpenseType {
  expenseTypeId: string;
  name: string;
  code: number;
  allowed: boolean;
  requests: ReimbursementRequest[];
}
