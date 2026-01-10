import { WbsNumber, User } from '../..';

export interface IndexCode {
  indexCodeId: string;
  name: string;
  code: string;
  userCreated: User;
  dateCreated: Date;
}

export interface ReimbursementRequestRow {
  identifier: number;
  id: string;
  saboId: number | undefined;
  amount: number;
  dateSubmitted: Date;
  status: ReimbursementStatusType;
  dateSubmittedToSabo: Date | undefined;
  submitter: User;
  vendor: Vendor;
  refundSource: IndexCode;
  financeMemberAssigned: User | undefined;
  reimbursementProducts: ReimbursementProduct[];
}

export enum ReimbursementStatusType {
  PENDING_LEADERSHIP_APPROVAL = 'PENDING_LEADERSHIP_APPROVAL',
  PENDING_FINANCE = 'PENDING_FINANCE',
  LEADERSHIP_APPROVED = 'LEADERSHIP_APPROVED',
  PENDING_SABO_SUBMISSION = 'PENDING_SABO_SUBMISSION',
  SABO_SUBMITTED = 'SABO_SUBMITTED',
  ADVISOR_APPROVED = 'ADVISOR_APPROVED',
  REIMBURSED = 'REIMBURSED',
  DENIED = 'DENIED'
}

export interface ReimbursementStatus {
  reimbursementStatusId: string;
  type: ReimbursementStatusType;
  user: User;
  dateCreated: Date;
}

export interface Receipt {
  receiptId: string;
  googleFileId: string;
  name: string;
}

export interface ReimbursementRequest {
  reimbursementRequestId: string;
  identifier: number;
  saboId?: number;
  dateCreated: Date;
  dateOfExpense?: Date;
  reimbursementStatuses: ReimbursementStatus[];
  recipient: User;
  vendor: Vendor;
  indexCode: IndexCode;
  totalCost: number;
  receiptPictures: Receipt[];
  reimbursementProducts: ReimbursementProduct[];
  dateDelivered?: Date;
  accountCode: AccountCode;
  comments: ReimbursementRequestComment[];
  assignee?: User;
}

export interface OtherProductReason {
  otherProductReasonId: string;
  name: string;
  userCreated: User;
  dateCreated: Date;
  budget: number;
  indexCode: IndexCode;
  accountCodes: AccountCode[];
}

export type WBSElementData = { wbsNum: WbsNumber; wbsName: string };

export type ReimbursementProductReason = WBSElementData | OtherProductReason;
export interface ReimbursementProduct {
  reimbursementProductId: string;
  name: string;
  cost: number;
  refundSources: RefundSource[];
  reimbursementProductReason: ReimbursementProductReason;
}

export interface Vendor {
  vendorId: string;
  dateCreated: Date;
  name: string;
  username?: string;
  password?: string;
  taxExempt: boolean;
  twoFactorContacts: User[];
  addedBy: User;
  discountCode?: string;
  notes?: string;
}

export interface AccountCode {
  accountCodeId: string;
  name: string;
  code: number;
  amount?: number;
  allowed: boolean;
  indexCodes: IndexCode[];
}

export interface RefundSource {
  refundSourceId: string;
  indexCode: IndexCode;
  amount: number;
}

export interface CreateRefundSourceArgs {
  indexCode: IndexCode;
  amount: number;
}

export interface ReimbursementProductCreateArgs {
  id?: string;
  name: string;
  cost: number;
  refundSources: CreateRefundSourceArgs[];
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
  wbsElementId: string;
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

export interface ReimbursementRequestComment {
  reimbursementRequestCommentId: string;
  reimbursementRequestId: string;
  dateCreated: Date;
  comment: string;
  userCreated: User;
}
