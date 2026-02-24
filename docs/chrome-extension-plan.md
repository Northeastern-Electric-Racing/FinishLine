# FinishLine → SAP Concur Chrome Extension: Technical Plan

## Table of Contents

1. [Problem Statement](#problem-statement)
2. [Solution Overview](#solution-overview)
3. [Feasibility Analysis](#feasibility-analysis)
4. [Architecture](#architecture)
5. [Repository Structure](#repository-structure)
6. [Authentication Flow](#authentication-flow)
7. [Backend Changes Required](#backend-changes-required)
8. [Extension Implementation Details](#extension-implementation-details)
9. [Distribution Strategy](#distribution-strategy)
10. [Development Workflow](#development-workflow)
11. [Future Tasks: Concur DOM Integration](#future-tasks-concur-dom-integration)
12. [Implementation Phases](#implementation-phases)
13. [Open Questions](#open-questions)

---

## Problem Statement

When a reimbursement request (RR) reaches "Pending SABO Submission" status in FinishLine, a finance team member must manually copy every field from FinishLine into SAP Concur's expense report form. The current workflow involves opening the `SubmitToSaboModal`, clicking individual "Copy to Clipboard" buttons for ~15 fields (name, address, NUID, expense details, account codes, etc.), and pasting them one by one into Concur. Receipt images must also be manually downloaded and re-uploaded.

This is slow, error-prone, and creates a bottleneck where the finance team is doing data entry instead of financial oversight.

## Solution Overview

A Chrome extension that:

1. Authenticates the user against the FinishLine backend (independent of the browser's active Google session)
2. Detects when the user is on a Concur expense report form page
3. Presents a UI to select a reimbursement request that is ready for SABO submission
4. Auto-fills the Concur form fields with data from the selected RR
5. Downloads receipt images from Google Drive (via the FinishLine backend) and uploads them to Concur's receipt fields
6. Detects when the user submits the Concur form and calls the FinishLine backend to mark the RR as submitted to SABO

## Feasibility Analysis

### Pulling receipt images from FinishLine and uploading to Concur form fields

**Verdict: Feasible.**

Receipts are stored in Google Drive with public read permissions (set during upload in `google-integration.utils.ts`). The backend already has a `GET /reimbursement-requests/receipt-image/:fileId` endpoint that downloads files from Drive and returns the buffer. The extension's background service worker can fetch this endpoint, receive the image as a blob, and construct a `File` object.

For setting file input values programmatically, the `DataTransfer` API is well-supported in modern Chrome:

```js
const blob = await fetchReceiptFromBackend(fileId);
const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
const dataTransfer = new DataTransfer();
dataTransfer.items.add(file);
fileInput.files = dataTransfer.files;
// Dispatch events so the framework picks up the change
fileInput.dispatchEvent(new Event('change', { bubbles: true }));
```

**Key risk:** Concur may use a custom upload widget (drag-and-drop zone, React-managed file input, or Shadow DOM) rather than a standard `<input type="file">`. This needs investigation on the actual Concur page. See [Future Tasks: Concur DOM Integration](#future-tasks-concur-dom-integration).

### Authenticating users independent of the browser's Google session

**Verdict: Feasible. Multiple good approaches available.**

The recommended approach uses `chrome.identity.launchWebAuthFlow()` to open a dedicated Google OAuth flow in a separate window. This lets the user sign into their FinishLine-associated Google account regardless of which Google account is active in the browser. The resulting `id_token` is sent to the FinishLine backend's existing login endpoint, and the returned JWT is stored in `chrome.storage.local`.

This requires a small backend change: the existing `requireJwtProd` middleware only reads JWTs from cookies. It needs a fallback to also accept `Authorization: Bearer <token>` headers. This is a standard pattern and also makes the API more accessible to future clients.

### Sending requests back to the backend on form submission

**Verdict: Feasible. The endpoint already exists.**

The backend already has `POST /:requestId/mark-sabo-submitted` which transitions the RR status to `SABO_SUBMITTED`. The extension's content script can detect form submission on the Concur page (via event listeners or navigation detection) and message the background service worker to call this endpoint.

The background service worker's `fetch()` calls are not subject to CORS restrictions the same way browser pages are, so the extension origin does not strictly need to be in the CORS allowlist for requests made from the service worker. However, adding the extension origin to CORS is still good practice for any direct content script requests.

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Chrome Extension                         │
│                                                                 │
│  ┌──────────┐    chrome.runtime     ┌────────────────────────┐  │
│  │  Popup   │◄────.sendMessage()───►│  Background Service    │  │
│  │  (React) │                       │  Worker                │  │
│  │          │                       │                        │  │
│  │ - Login  │                       │ - Auth state (JWT)     │  │
│  │ - Select │                       │ - API calls to         │  │
│  │   RR     │                       │   FinishLine backend   │  │
│  │ - Status │                       │ - Receipt downloads    │  │
│  └──────────┘                       └───────────┬────────────┘  │
│                                                 │               │
│                                    chrome.runtime│               │
│                                    .sendMessage()│               │
│                                                 │               │
│  ┌──────────────────────────────────────────────▼────────────┐  │
│  │  Content Script (injected into Concur pages)              │  │
│  │                                                           │  │
│  │  - Detects Concur expense form pages                      │  │
│  │  - Receives RR data from background worker                │  │
│  │  - Auto-fills form fields via DOM manipulation            │  │
│  │  - Uploads receipts to file inputs                        │  │
│  │  - Detects form submission                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ fetch() with JWT
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FinishLine Backend                           │
│                                                                 │
│  Existing endpoints used:                                       │
│  - POST /users/auth/login          (authenticate)               │
│  - GET  /reimbursement-requests/*  (fetch RR list & details)    │
│  - GET  /receipt-image/:fileId     (download receipts)          │
│  - POST /:requestId/mark-sabo-submitted (mark as submitted)    │
│                                                                 │
│  New/modified:                                                  │
│  - requireJwtProd: accept Authorization header as fallback      │
│  - CORS: add extension origin (optional, for content scripts)   │
└─────────────────────────────────────────────────────────────────┘
```

### Communication Patterns

| From | To | Mechanism | Purpose |
|---|---|---|---|
| Popup | Background SW | `chrome.runtime.sendMessage()` | Login, fetch RR list, select RR |
| Background SW | FinishLine API | `fetch()` with JWT in Authorization header | All API calls |
| Background SW | Content Script | `chrome.tabs.sendMessage()` | Send RR data for autofill |
| Content Script | Background SW | `chrome.runtime.sendMessage()` | Report form submission, request receipt blobs |
| Content Script | Concur Page DOM | Direct DOM manipulation | Fill form fields, upload receipts |

## Repository Structure

The extension lives in the existing monorepo as a new yarn workspace alongside `backend`, `frontend`, and `shared`.

### Root package.json change

```json
"workspaces": [
  "src/backend",
  "src/frontend",
  "src/shared",
  "src/chrome-extension"
]
```

### New root-level scripts

```json
"extension:dev": "yarn workspace chrome-extension dev",
"extension:build": "yarn workspace chrome-extension build",
"extension:zip": "yarn workspace chrome-extension zip"
```

### Extension directory layout

```
src/chrome-extension/
├── package.json
├── wxt.config.ts                  # WXT configuration
├── tsconfig.json
├── assets/
│   └── icons/
│       ├── icon-16.png
│       ├── icon-48.png
│       └── icon-128.png
├── entrypoints/
│   ├── popup/                     # Extension popup (React)
│   │   ├── App.tsx                # Root component with auth routing
│   │   ├── index.html
│   │   ├── main.tsx               # React entry point
│   │   ├── components/
│   │   │   ├── LoginView.tsx      # Google sign-in button
│   │   │   ├── RRListView.tsx     # List of eligible RRs
│   │   │   ├── RRDetailView.tsx   # Selected RR details + "Fill Form" button
│   │   │   └── StatusView.tsx     # Confirmation / error states
│   │   └── hooks/
│   │       ├── useAuth.ts         # Auth state management
│   │       └── useReimbursementRequests.ts
│   ├── background.ts             # Background service worker
│   └── concur-content.ts         # Content script for Concur pages
├── lib/
│   ├── api.ts                     # FinishLine API client (fetch wrapper with JWT)
│   ├── auth.ts                    # Google OAuth + JWT management
│   ├── messages.ts                # Typed message definitions for chrome.runtime messaging
│   ├── storage.ts                 # chrome.storage.local helpers
│   └── concur/
│       ├── detector.ts            # Detect which Concur page/form we're on
│       ├── field-map.ts           # Mapping of RR fields → Concur DOM selectors
│       └── filler.ts              # DOM manipulation logic for filling fields
└── types/
    └── index.ts                   # Extension-specific types (re-exports shared types as needed)
```

### WXT Configuration (wxt.config.ts)

```ts
import { defineConfig } from 'wxt';

export default defineConfig({
  srcDir: '.',
  entrypointsDir: 'entrypoints',
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'FinishLine for Concur',
    description: 'Auto-fill SAP Concur expense reports from FinishLine reimbursement requests',
    permissions: ['storage', 'identity', 'activeTab'],
    host_permissions: [
      'https://www.concursolutions.com/*',
      'https://us2.concursolutions.com/*',     // adjust to actual Concur instance URL
      'https://finishlinebyner.com/*',
      'http://localhost:3001/*'                 // dev backend
    ],
    oauth2: {
      client_id: '<GOOGLE_CLIENT_ID>',
      scopes: ['openid', 'email', 'profile']
    }
  }
});
```

### Extension package.json

```json
{
  "name": "chrome-extension",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wxt",
    "build": "wxt build",
    "zip": "wxt zip"
  },
  "dependencies": {
    "shared": "1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "wxt": "latest",
    "@wxt-dev/module-react": "latest",
    "typescript": "^5.7.3",
    "@types/chrome": "latest",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0"
  }
}
```

The `shared` dependency resolves locally via yarn workspaces — no publishing needed. This gives the extension direct access to all shared types (`ReimbursementRequest`, `ReimbursementStatusType`, `Receipt`, `Vendor`, `AccountCode`, etc.).

## Authentication Flow

### Initial Login

```
User clicks extension icon
        │
        ▼
  Popup renders LoginView
        │
        ▼
  User clicks "Sign in with Google"
        │
        ▼
  Popup sends message to background SW
        │
        ▼
  Background SW calls chrome.identity.launchWebAuthFlow()
  (Opens a separate Google sign-in window — user can pick any account)
        │
        ▼
  Google returns id_token via redirect URL
        │
        ▼
  Background SW sends POST to FinishLine /users/auth/login
  with { id_token } in the request body
        │
        ▼
  Backend verifies Google token, finds/creates user, generates JWT
  Returns JWT in response body (new behavior, in addition to cookie)
        │
        ▼
  Background SW stores JWT in chrome.storage.local
  Also stores basic user info (name, userId, organizationId)
        │
        ▼
  Popup re-renders with authenticated state → shows RR list
```

### Subsequent Sessions

```
User clicks extension icon
        │
        ▼
  Popup sends message to background SW to check auth
        │
        ▼
  Background SW reads JWT from chrome.storage.local
        │
        ├── JWT exists and not expired → return user info → show RR list
        │
        └── JWT missing or expired → return null → show LoginView
```

### JWT Refresh Strategy

The current JWT expires in 12 hours. For the extension, the simplest approach is:

- On any 401 response from the backend, clear stored JWT and prompt re-login
- Users will need to re-authenticate roughly once per day, which is acceptable for this use case
- A future enhancement could implement silent re-auth using `chrome.identity.launchWebAuthFlow({ interactive: false })` to get a fresh Google token without user interaction

## Backend Changes Required

These are small, focused changes to the existing codebase.

### 1. Accept Authorization header in production JWT middleware

**File:** `src/backend/src/utils/auth.utils.ts`

**Change:** Modify `requireJwtProd` to check for a `Bearer` token in the `Authorization` header as a fallback when no cookie is present.

```ts
// Current behavior: only reads from cookies
const { token } = req.cookies;

// New behavior: check Authorization header as fallback
const { token } = req.cookies;
const authHeader = req.headers.authorization;
const jwtToken = token || (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null);
```

This is a non-breaking change. Cookie-based auth (used by the frontend) continues working exactly as before. The extension uses the `Authorization` header.

### 2. Return JWT in login response body

**File:** `src/backend/src/controllers/users.controllers.ts`

**Change:** In `logUserIn`, include the token in the response JSON in addition to setting the cookie.

```ts
// Current
res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
res.status(200).json(user);

// New: also include token in the body
res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
res.status(200).json({ ...user, token });
```

The frontend currently reads the response as an `AuthenticatedUser` object and ignores extra fields, so this is backward-compatible. The extension reads the `token` field from the response.

### 3. Add extension origin to CORS (optional but recommended)

**File:** `src/backend/index.ts`

**Change:** Add the extension's origin to `allowedOrigins`.

```ts
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://finishlinebyner.com',
  'https://qa.finishlinebyner.com',
  'chrome-extension://<extension-id>'  // Added for Chrome extension
];
```

The extension ID is stable when:
- Loaded in developer mode from the same directory (ID derived from path)
- Published to Chrome Web Store (ID assigned permanently)
- A `key` field is set in the manifest (forces a specific ID)

For development, you can either hardcode the dev ID after first load or temporarily relax origin checking. For production, the ID is known after Chrome Web Store publishing.

### 4. Verify organizationId is accessible from login response

The extension needs to include the `organizationId` header on all API requests (required by the `getOrganization` middleware). The login response must include the user's organizations so the extension can store and send the correct org ID. The `authenticatedUserTransformer` likely already includes organizations in the `AuthenticatedUser` type — verify this and ensure the extension extracts and stores it during login.

## Extension Implementation Details

### Typed Messaging System

Define typed messages for communication between popup, background, and content scripts:

```ts
// lib/messages.ts
import { ReimbursementRequest } from 'shared';

// Messages from popup/content → background
type MessageMap = {
  'auth:login': { payload: undefined; response: { success: boolean; user?: AuthState } };
  'auth:logout': { payload: undefined; response: void };
  'auth:check': { payload: undefined; response: AuthState | null };
  'rr:list': { payload: undefined; response: ReimbursementRequest[] };
  'rr:get': { payload: { requestId: string }; response: ReimbursementRequest };
  'rr:mark-submitted': { payload: { requestId: string }; response: { success: boolean } };
  'receipt:download': { payload: { fileId: string }; response: Blob };
};

// Messages from background → content script
type ContentMessageMap = {
  'fill-form': { payload: { rr: ReimbursementRequest; receipts: Blob[] }; response: { success: boolean } };
  'check-page': { payload: undefined; response: { isConcurForm: boolean } };
};
```

### API Client

```ts
// lib/api.ts
import { storage } from './storage';

const API_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3001'
  : 'https://finishlinebyner.com';   // adjust to actual production API URL

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { jwt, organizationId } = await storage.getAuth();

  if (!jwt) throw new Error('Not authenticated');

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
      'organizationId': organizationId,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    await storage.clearAuth();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
```

### Background Service Worker

The background service worker handles all API communication and auth state:

```ts
// entrypoints/background.ts
export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    handleMessage(message).then(sendResponse);
    return true; // keep channel open for async response
  });
});

async function handleMessage(message: Message) {
  switch (message.type) {
    case 'auth:login':
      return handleLogin();
    case 'auth:check':
      return checkAuth();
    case 'rr:list':
      return apiFetch('/reimbursement-requests/current-user');
    case 'rr:get':
      return apiFetch(`/reimbursement-requests/${message.payload.requestId}`);
    case 'rr:mark-submitted':
      return apiFetch(
        `/reimbursement-requests/${message.payload.requestId}/mark-sabo-submitted`,
        { method: 'POST' }
      );
    case 'receipt:download':
      return downloadReceipt(message.payload.fileId);
  }
}
```

### Content Script: Concur Page Detection

The content script is injected into Concur pages and waits for instructions:

```ts
// entrypoints/concur-content.ts
export default defineContentScript({
  matches: [
    'https://www.concursolutions.com/*',
    'https://us2.concursolutions.com/*',
    // Add other Concur domains as discovered
  ],
  main() {
    // Listen for messages from the background service worker
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'fill-form') {
        fillConcurForm(message.payload.rr, message.payload.receipts)
          .then(result => sendResponse(result));
        return true;
      }
      if (message.type === 'check-page') {
        sendResponse({ isConcurForm: detectConcurExpenseForm() });
      }
    });

    // Notify background that content script is ready
    chrome.runtime.sendMessage({ type: 'content-script-ready' });

    // Watch for form submission to trigger mark-as-submitted
    observeFormSubmission();
  }
});
```

### Popup UI

The popup is a small React app with straightforward view routing:

```
LoginView          → User not authenticated, shows Google sign-in button
    │
    ▼ (after login)
RRListView         → Shows RRs with status PENDING_SABO_SUBMISSION or LEADERSHIP_APPROVED
    │
    ▼ (user selects an RR)
RRDetailView       → Shows RR summary, "Auto-Fill Concur Form" button
    │
    ▼ (user clicks fill)
StatusView         → Shows progress (filling fields, uploading receipts), success/error
```

The popup should be kept simple and lightweight. No need for MUI here (it would bloat the extension bundle significantly). Use basic CSS or Tailwind (WXT has easy Tailwind integration).

### RR Selection Logic

The extension should filter RRs to show only those that are eligible for SABO submission. Based on the existing status flow:

```ts
const eligibleStatuses = [
  ReimbursementStatusType.LEADERSHIP_APPROVED,
  ReimbursementStatusType.PENDING_SABO_SUBMISSION,
];
```

The endpoint to use depends on the user's role:
- **Finance team members:** `GET /reimbursement-requests/` (all RRs) filtered client-side by eligible status
- **Regular users:** `GET /reimbursement-requests/current-user` (own RRs only)

Alternatively, a new lightweight endpoint could be added that returns only eligible RRs with the minimal fields needed for the extension popup list (id, identifier, vendor name, total cost, status). This would reduce payload size and avoid over-fetching.

## Distribution Strategy

### Development / Testing Phase

Use **developer mode sideloading**:

1. Run `yarn extension:build`
2. Go to `chrome://extensions` in Chrome
3. Enable "Developer mode"
4. Click "Load unpacked" → select `src/chrome-extension/.output/chrome-mv3`

This is instant, free, and doesn't require any review process. Suitable for the development team and early testers.

### Production Distribution (Recommended: Chrome Web Store Unlisted)

Publish to the Chrome Web Store with **Unlisted** visibility:

- The extension will **not** appear in Chrome Web Store search results
- Users install via a direct link shared through Slack, docs, or email
- One-time $5 Google developer registration fee
- Users get one-click install ("Add to Chrome") and automatic updates
- Review process typically takes 1-3 business days for initial submission
- Extension ID is permanently assigned and stable

### Alternative: Private to Organization

If Northeastern has a Google Workspace domain, the extension can be published privately so only `@northeastern.edu` or `@husky.neu.edu` accounts can see and install it. This adds access control but requires Google Workspace admin involvement.

### Recommendation

Start with **developer mode sideloading** during development (Phase 1-3). Once stable, publish as **Unlisted on Chrome Web Store** for the clean install experience and automatic updates.

## Development Workflow

### Initial Setup

```bash
# From repo root (after adding workspace to package.json)
yarn install

# Start extension dev server (auto-reloads on changes, opens Chrome)
yarn extension:dev
```

### Day-to-Day Development

1. `yarn extension:dev` — starts WXT dev server with hot module reload
2. Make changes to popup React components, background script, or content script
3. Extension auto-reloads in the browser
4. For content script changes: navigate to a Concur page to test
5. Use Chrome DevTools for debugging:
   - **Popup:** Right-click extension icon → "Inspect popup"
   - **Background SW:** `chrome://extensions` → click "Inspect views: service worker"
   - **Content script:** Normal DevTools console on the Concur page (select the extension's context from the console dropdown)

### Building for Distribution

```bash
# Build production bundle
yarn extension:build

# Create .zip for Chrome Web Store upload
yarn extension:zip
```

### CI/CD Integration

Add a GitHub Actions workflow:

1. **On PRs:** Build the extension to verify compilation (fast, no deployment)
2. **On release tags:** Build, zip, and attach the `.zip` as a GitHub release artifact
3. **(Optional future):** Auto-publish to Chrome Web Store using the [Chrome Web Store Publish API](https://developer.chrome.com/docs/webstore/using-api/)

## Future Tasks: Concur DOM Integration

This is the most uncertain part of the project and requires hands-on investigation of the actual Concur web interface. These tasks should be done early as proof-of-concept work before building out the full extension.

### Task 1: Map the Concur expense form DOM structure

**Goal:** Document every form field on the Concur expense report creation page.

**Steps:**
1. Log into Concur with a test account
2. Navigate to creating a new expense report
3. Open Chrome DevTools
4. For each field that FinishLine's `SubmitToSaboModal` displays, find the corresponding DOM element in Concur
5. Document: element type, selector strategy (id, name, class, data attribute, aria label), whether it's a standard input or custom widget, and what framework Concur uses (React, Angular, plain HTML)

**Fields to map (from SubmitToSaboModal):**

| FinishLine Field | Data Source | Expected Concur Field Type |
|---|---|---|
| First Name | `recipient.firstName` | Text input |
| Last Name | `recipient.lastName` | Text input |
| Phone # | `userSecureSettings.phoneNumber` | Text input |
| NUID | `userSecureSettings.nuid` | Text input |
| Email | `recipient.email` | Text input |
| Street Address | `userSecureSettings.street` | Text input |
| City | `userSecureSettings.city` | Text input |
| State | `userSecureSettings.state` | Dropdown / text input |
| Zip Code | `userSecureSettings.zipcode` | Text input |
| Date of Expense | `dateOfExpense` | Date picker |
| Total Expense | `totalCost` (cents → dollars) | Currency input |
| Expense Description | `vendor.name[totalCost]` | Text input / textarea |
| Business Purpose | Concatenated product reasons | Text input / textarea |
| Index Code | `indexCode.code - indexCode.name` | Dropdown / text input |
| Account Code | `accountCode.code - accountCode.name` | Dropdown / text input |
| Receipts | `receiptPictures[].googleFileId` | File upload |

### Task 2: Prototype filling a single text field

**Goal:** Verify that programmatically setting a value in a Concur form field actually works (the field accepts the value, the form framework recognizes it, and it persists when you move to another field).

**Approach:**
1. Open Concur expense form
2. In DevTools console, try:
   ```js
   const input = document.querySelector('<selector>');
   const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
     window.HTMLInputElement.prototype, 'value'
   ).set;
   nativeInputValueSetter.call(input, 'test value');
   input.dispatchEvent(new Event('input', { bubbles: true }));
   input.dispatchEvent(new Event('change', { bubbles: true }));
   ```
3. Check if the value sticks and the form validates it

If Concur uses React, the native setter + event dispatch pattern is necessary because React uses a synthetic event system that doesn't recognize direct `.value` assignments.

### Task 3: Prototype receipt file upload

**Goal:** Determine how Concur's receipt upload works and verify programmatic file upload.

**Steps:**
1. Find the receipt upload element in the DOM
2. Determine if it's a standard `<input type="file">`, a drag-and-drop zone, or a custom widget
3. If standard input: test the `DataTransfer` approach
4. If drag-and-drop: test simulating drag events (`dragenter`, `dragover`, `drop` with a `DataTransfer` containing a `File`)
5. If custom widget: investigate the widget's internal API or event handlers

### Task 4: Prototype form submission detection

**Goal:** Reliably detect when the user successfully submits the Concur expense report.

**Options to investigate:**
- Listen for a click on the submit button
- Watch for URL navigation after submission
- Use a `MutationObserver` to detect a success confirmation appearing in the DOM
- Intercept the XHR/fetch request that Concur sends on submission

### Task 5: Handle Concur page variations

**Goal:** Understand if Concur has different page layouts, multi-step forms, or conditionally rendered fields that the extension needs to handle.

**Considerations:**
- Does the expense form load in one page or multiple steps/tabs?
- Are there iframes that would block content script access?
- Do different expense types have different form fields?
- Is the page URL stable and predictable for content script `matches` patterns?

## Implementation Phases

### Phase 0: Concur Investigation (1-2 days)

- [ ] Complete Tasks 1-3 from [Future Tasks](#future-tasks-concur-dom-integration)
- [ ] Document findings in a Concur DOM mapping document
- [ ] Identify any blockers (e.g., iframes, Shadow DOM, custom widgets that can't be automated)
- [ ] **Go/no-go decision** on the Chrome extension approach based on findings

### Phase 1: Scaffold + Auth (2-3 days)

- [ ] Add `chrome-extension` workspace to monorepo
- [ ] Set up WXT with React + TypeScript
- [ ] Implement backend changes (Authorization header support in `requireJwtProd`, token in login response body)
- [ ] Build popup login flow with `chrome.identity.launchWebAuthFlow()`
- [ ] Verify end-to-end: extension login → JWT stored → authenticated API call → RR list returned

### Phase 2: RR Selection UI (1-2 days)

- [ ] Build popup RR list view (filtered to eligible statuses)
- [ ] Build RR detail view with field summary
- [ ] Add "Auto-Fill Form" button (wired but non-functional until Phase 3)

### Phase 3: Concur Auto-Fill (3-5 days)

- [ ] Implement content script with Concur page detection
- [ ] Build field mapping configuration (`lib/concur/field-map.ts`)
- [ ] Implement DOM manipulation for text fields, dropdowns, date pickers
- [ ] Implement receipt download (background SW) and upload (content script)
- [ ] Test against actual Concur forms

### Phase 4: Submission Detection + Status Update (1-2 days)

- [ ] Implement form submission detection in content script
- [ ] Wire up `mark-sabo-submitted` API call on submission
- [ ] Add confirmation UI in popup
- [ ] Handle error cases (submission failed, API call failed, network error)

### Phase 5: Polish + Distribution (1-2 days)

- [ ] Error handling and edge cases throughout
- [ ] Loading states in popup UI
- [ ] Extension icons and branding
- [ ] Build and test production bundle
- [ ] Publish as unlisted on Chrome Web Store (or document sideload instructions)
- [ ] Write user-facing documentation (how to install, how to use)

### Total Estimated Effort: 8-14 days

The range depends heavily on Concur's DOM complexity (Phase 0 findings) and how many edge cases surface during the auto-fill implementation (Phase 3).

## Open Questions

1. **Concur URL pattern:** What is the exact URL of the Concur instance Northeastern uses? (e.g., `us2.concursolutions.com`, `northeastern.concursolutions.com`, etc.) This is needed for the content script `matches` pattern and `host_permissions`.

2. **Who uses this?** Is the extension only for finance team members (who enter data into Concur on behalf of others), or should regular users also be able to fill their own expense reports? This affects which API endpoints to use and what RRs to display.

3. **Concur access for development:** Does the development team have access to a Concur test/sandbox environment, or will testing need to happen against the production Concur instance?

4. **Google OAuth client:** Can the existing FinishLine Google OAuth client ID be reused for the extension, or does a separate one need to be created? Chrome extensions typically need their own OAuth client with the extension ID in the authorized redirect URIs.

5. **Secure settings access:** The `SubmitToSaboModal` fetches `userSecureSettings` (address, NUID, phone) for the RR recipient. This endpoint (`getUserSecureSetting`) requires the caller to be on the finance team or a head. Should the extension only be usable by finance team members, or does the access model need adjustment?

6. **Multiple expense types:** Does Concur use different form layouts for different expense categories? If so, do all NER reimbursements use the same category/layout?

7. **SABO number:** The current flow has a separate step for setting a SABO number (`setSaboNumber` endpoint). Where does this number come from? Does Concur assign it after submission, or is it entered manually? Should the extension handle capturing and storing this number?
