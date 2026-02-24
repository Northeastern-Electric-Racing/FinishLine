// Typed messages for chrome.runtime messaging between popup, background, and content scripts

// Messages sent to the background service worker
export type BackgroundMessage =
  | { type: 'auth:check' }
  | { type: 'auth:login' }
  | { type: 'auth:logout' }
  | { type: 'rr:list' }
  | { type: 'rr:get'; payload: { requestId: string } }
  | { type: 'rr:mark-submitted'; payload: { requestId: string } }
  | { type: 'receipt:download'; payload: { fileId: string } };

// Messages sent to the content script
export type ContentMessage =
  | { type: 'fill-field'; payload: { selector: string; value: string } }
  | { type: 'check-page' };

// Response types
export interface AuthState {
  jwt: string;
  userId: string;
  name: string;
  organizationId: string;
}

export interface FillFieldResult {
  success: boolean;
  error?: string;
}

export interface CheckPageResult {
  isConcurForm: boolean;
}
