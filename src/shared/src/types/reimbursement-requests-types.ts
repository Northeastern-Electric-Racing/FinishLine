export enum Club_Account {
  CASH = 'CASH',
  BUDGET = 'BUDGET'
}

export interface ReimbursementRequest {
  reimbursementRequestId: string;
  saboId?: number;
  dateCreated: Date;
  dateDeleted?: Date;
  dateOfExpense: Date;
  reimbursementsStatuses: Reimbursement_Status[]; // ReimbursementStatus
  recepientId: number; // get rid of
  recepient: User; // RecipientPreview
  vendorId: string; // get rid of
  vendor: Vendor; // VendorPreview
  account: Club_Accounts; // ClubAccounts
  totalCost: number;
  receiptPictures: string[];
  reimbursementProducts: Reimbursement_Product[]; // ReimbursementProduct
  dateDelivered?: Date;
  expenseTypeId: string; // get rid of
  expenseType: Expense_Type; // ExpenseTypePreview
}
