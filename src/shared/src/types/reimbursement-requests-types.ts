import { WbsNumber } from './project-types';
import { User } from './user-types';

export enum ClubAccount {
  CASH = 'CASH',
  BUDGET = 'BUDGET'
}

export enum ReimbursementStatusType {
  PENDING_FINANCE = 'PENDING_FINANCE',
  SABO_SUBMITTED = 'SABO_SUBMITTED',
  ADVISOR_APPROVED = 'ADVISOR_APPROVED',
  REIMBURSED = 'REIMBURSED',
  DENIED = 'DENIED'
}

export interface ReimbursementStatus {
  reimbursementStatusId: number;
  type: ReimbursementStatusType;
  user: User;
  dateCreated: Date;
}

export interface Receipt {
  receiptId: string;
  googleFileId: string;
  name: string;
  dateDeleted?: Date;
  deletedBy?: User;
}

export interface ReimbursementRequest {
  reimbursementRequestId: string;
  saboId?: number;
  dateCreated: Date;
  dateDeleted?: Date;
  dateOfExpense: Date;
  reimbursementStatuses: ReimbursementStatus[];
  recipient: User;
  vendor: Vendor;
  account: ClubAccount;
  totalCost: number;
  receiptPictures: Receipt[];
  reimbursementProducts: ReimbursementProduct[];
  dateDelivered?: Date;
  accountCode: AccountCode;
}

export enum OtherProductReason {
  ToolsAndEquipment = 'TOOLS_AND_EQUIPMENT',
  Competition = 'COMPETITION',
  Consumables = 'CONSUMABLES',
  GeneralStock = 'GENERAL_STOCK',
  SubscriptionsAndMemberships = 'SUBSCRIPTIONS_AND_MEMBERSHIPS'
}

export type WBSElementData = { wbsNum: WbsNumber; wbsName: string };

export type ReimbursementProductReason = WBSElementData | OtherProductReason;
export interface ReimbursementProduct {
  reimbursementProductId: string;
  name: string;
  dateDeleted?: Date;
  cost: number;
  reimbursementProductReason: ReimbursementProductReason;
}

export interface Vendor {
  vendorId: string;
  dateCreated: Date;
  name: string;
}

export interface AccountCode {
  accountCodeId: string;
  name: string;
  code: number;
  allowed: boolean;
  allowedRefundSources: ClubAccount[];
}

export interface ReimbursementProductCreateArgs {
  id?: string;
  name: string;
  cost: number;
}

export interface ReimbursementProductFormArgs extends ReimbursementProductCreateArgs {
  reason: WbsNumber | OtherProductReason;
}

export interface OtherReimbursementProductCreateArgs extends ReimbursementProductCreateArgs {
  reason: OtherProductReason;
}

export interface WbsReimbursementProductCreateArgs extends ReimbursementProductCreateArgs {
  reason: WbsNumber;
}

export interface ValidatedWbsReimbursementProductCreateArgs extends ReimbursementProductCreateArgs {
  wbsElementId: number;
  wbsNum: WbsNumber;
}

export interface ReimbursementReceiptCreateArgs {
  googleFileId: string;
  name: string;
}

export interface ReimbursementReceiptUploadArgs extends ReimbursementReceiptCreateArgs {
  file?: File;
}

export interface Reimbursement {
  reimbursementId: string;
  dateCreated: Date;
  amount: number;
  userSubmitted: User;
}
