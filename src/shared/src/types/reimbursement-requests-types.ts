import { WbsNumber } from './project-types.js';
import { BaseUser, User } from './user-types.js';

export interface IndexCode {
  indexCodeId: string;
  name: string;
  code: string;
  userCreated: User;
  dateCreated: Date;
}

/** A row of the reimbursement request tables, built from a ReimbursementRequestTableItem */
export interface ReimbursementRequestRow {
  identifier: number;
  id: string;
  saboId: string | undefined;
  amount: number;
  dateSubmitted: Date;
  status: ReimbursementStatusType;
  dateSubmittedToSabo: Date | undefined;
  submitter: BaseUser;
  financeMemberAssigned: BaseUser | undefined;
  reimbursementProducts: ReimbursementRequestTableItem['reimbursementProducts'];
  description?: string;
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

export interface Receipt {
  receiptId: string;
  googleFileId: string;
  name: string;
}

/** The minimum every reimbursement request consumer needs */
export interface BaseReimbursementRequest {
  reimbursementRequestId: string;
  identifier: number;
  saboId?: string;
  dateCreated: Date;
  description?: string;
  totalCost: number;
  recipient: BaseUser;
  // every status it has had, oldest first; the status checks only need the types
  statusTypes: ReimbursementStatusType[];
  // the type of the newest status
  currentStatus: ReimbursementStatusType;
}

/** Why a product was bought: the wbs element it's for, or an "other" reason */
export type ReimbursementProductReasonPreview = WBSElementData | Pick<OtherProductReason, 'otherProductReasonId' | 'name'>;

/** A row of the My Requests, Assigned To Me, and All Requests tables */
export interface ReimbursementRequestTableItem extends BaseReimbursementRequest {
  // when it was marked SABO submitted, if it has been
  dateSubmittedToSabo?: Date;
  assignee?: BaseUser;
  reimbursementProducts: { name?: string; reimbursementProductReason: ReimbursementProductReasonPreview }[];
}

/** A product on the reimbursement request detail page and edit form */
export interface ReimbursementProductDetail {
  reimbursementProductId: string;
  name?: string;
  cost: number;
  materialId?: string;
  refundSources: { refundSourceId: string; amount: number; indexCode: Pick<IndexCode, 'indexCodeId' | 'code' | 'name'> }[];
  reimbursementProductReason: ReimbursementProductReasonPreview;
}

/** A comment on the reimbursement request timeline */
export interface ReimbursementRequestCommentPreview {
  reimbursementRequestCommentId: string;
  comment: string;
  dateCreated: Date;
}

/** The reimbursement request detail page, its modals, and the edit form */
export interface ReimbursementRequestDetail extends BaseReimbursementRequest {
  dateOfExpense?: Date;
  dateDelivered?: Date;
  // the Submit to SABO modal shows the recipient's email
  recipient: BaseUser & { email: string };
  assignee?: BaseUser;
  vendor: Pick<Vendor, 'vendorId' | 'name'>;
  indexCode: Pick<IndexCode, 'indexCodeId' | 'code' | 'name'>;
  accountCode: Pick<AccountCode, 'accountCodeId' | 'code' | 'name'>;
  receiptPictures: Receipt[];
  reimbursementProducts: ReimbursementProductDetail[];
  comments: ReimbursementRequestCommentPreview[];
}

/** A row of a project's Budget tab: a request with a product bought for the project */
export interface ProjectSpendingItem extends BaseReimbursementRequest {
  productNames: string[];
  // the cost of just the products bought for the project
  projectCost: number;
}

/** A row of the reimbursement requests CSV export */
export interface ReimbursementRequestExportRow extends BaseReimbursementRequest {
  dateDelivered?: Date;
  dateSubmittedToSabo?: Date;
  vendor: Pick<Vendor, 'name'>;
  accountCode: Pick<AccountCode, 'code'>;
  indexCode: Pick<IndexCode, 'code' | 'name'>;
}

/** How much has been spent from an index code, for the Total Amount Spent modal */
export interface IndexCodeSpending {
  indexCodeId: string;
  totalSpent: number;
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

export interface CreateRefundSourceArgs {
  // the form fills these from the request or the account codes; the server only reads the id
  indexCode: Pick<IndexCode, 'indexCodeId' | 'code' | 'name'>;
  amount: number;
}

export interface ReimbursementProductCreateArgs {
  id?: string;
  name?: string;
  materialId?: string;
  cost: number;
  refundSources: CreateRefundSourceArgs[];
}

// the form and the server only read an "other" reason's id and name
export type OtherProductReasonArg = Pick<OtherProductReason, 'otherProductReasonId' | 'name'>;

export interface ReimbursementProductFormArgs extends ReimbursementProductCreateArgs {
  reason: WbsNumber | OtherProductReasonArg;
}

export interface OtherReimbursementProductCreateArgs extends ReimbursementProductCreateArgs {
  reason: OtherProductReasonArg;
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
