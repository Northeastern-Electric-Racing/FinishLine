// Typed messages for chrome.runtime messaging between popup, background, and content scripts

// Messages sent to the background service worker
export type BackgroundMessage =
  | { type: 'auth:check' }
  | { type: 'auth:users' }
  | { type: 'auth:login'; payload: { userId: string } }
  | { type: 'auth:login:google' }
  | { type: 'auth:logout' }
  | { type: 'rr:list' }
  | { type: 'rr:get'; payload: { requestId: string } }
  | { type: 'rr:mark-submitted'; payload: { requestId: string } }
  | { type: 'receipt:download'; payload: { fileId: string } }
  | { type: 'fill:start'; payload: ActiveFill };

// Messages sent to the content script
export type ContentMessage =
  | { type: 'fill-field'; payload: { selector: string; value: string } }
  | { type: 'check-page' };

// Auth state stored in chrome.storage.local
export type AuthState =
  | { mode: 'dev'; userId: string; name: string; organizationId: string }
  | { mode: 'prod'; jwt: string; userId: string; name: string; organizationId: string };

export interface DevUser {
  userId: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface RRListItem {
  reimbursementRequestId: string;
  identifier: number;
  status: string;
  vendorName: string;
  totalCost: number; // in cents
  dateCreated: string;
  dateOfExpense?: string;
  saboId?: number;
  products: string[]; // product names
  accountCodeName: string;
}

export interface ActiveFill {
  reimbursementRequestId: string;
  identifier: number;
  vendorName: string;
  totalCost: number;
  dateOfExpense?: string;
  products: string[];
  accountCodeName: string;
}

export interface FillFieldResult {
  success: boolean;
  error?: string;
}

export interface CheckPageResult {
  isConcurForm: boolean;
}
