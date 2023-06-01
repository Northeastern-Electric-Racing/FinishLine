/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsNumber } from './project-types';
import { UserPreview } from './user-types';

export enum ClubAccount {
  CASH = 'CASH',
  BUDGET = 'BUDGET'
}

export enum ReimbursementStatusType {
  PENDING_FINANCE = 'PENDING_FINANCE',
  SABO_SUBMITTED = 'SABO_SUBMITTED',
  ADVISOR_APPROVED = 'ADVISOR_APPROVED',
  REIMBURSED = 'REIMBURSED'
}

export interface ReimbursementStatus {
  reimbursementStatusId: number;
  type: ReimbursementStatusType;
  user: UserPreview;
  dateCreated: Date;
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
  recipient: UserPreview;
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
  | 'recipient'
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
  wbsName: string;
}

export type ReimbursementProductPreview = Pick<
  ReimbursementProduct,
  'reimbursementProductId' | 'name' | 'dateDeleted' | 'cost' | 'wbsNum'
>;

export interface Vendor {
  vendorId: string;
  dateCreated: Date;
  name: string;
}

export type VendorPreview = Pick<Vendor, 'vendorId' | 'dateCreated' | 'name'>;

export interface ExpenseType {
  expenseTypeId: string;
  name: string;
  code: number;
  allowed: boolean;
}

export type ExpenseTypePreview = Pick<ExpenseType, 'expenseTypeId' | 'name' | 'code' | 'allowed'>;
