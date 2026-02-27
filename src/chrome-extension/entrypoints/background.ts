import { storage } from '../lib/storage';
import { fetchDevUsers, loginDev, loginProd } from '../lib/auth';
import { apiFetch } from '../lib/api';
import type { BackgroundMessage, RRListItem } from '../lib/messages';

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
    handleMessage(message)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err instanceof Error ? err.message : String(err) }));
    return true; // keep channel open for async response
  });
});

async function handleMessage(message: BackgroundMessage): Promise<unknown> {
  switch (message.type) {
    case 'auth:check':
      return storage.getAuth();

    case 'auth:users':
      return fetchDevUsers();

    case 'auth:login': {
      const auth = import.meta.env.DEV
        ? await loginDev(message.payload.userId)
        : await loginProd();
      await storage.setAuth(auth);
      return auth;
    }

    case 'auth:login:google': {
      const auth = await loginProd();
      await storage.setAuth(auth);
      return auth;
    }

    case 'auth:logout':
      await storage.clearAuth();
      return { success: true };

    case 'rr:list': {
      const rawList = await apiFetch<any[]>('/reimbursement-requests/current-user');
      const items: RRListItem[] = rawList.map((rr) => {
        const sortedStatuses = [...(rr.reimbursementStatuses ?? [])].sort(
          (a: any, b: any) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        );
        return {
          reimbursementRequestId: rr.reimbursementRequestId,
          identifier: rr.identifier,
          status: sortedStatuses[0]?.type ?? 'UNKNOWN',
          vendorName: rr.vendor?.name ?? 'Unknown Vendor',
          totalCost: rr.totalCost ?? 0,
          dateCreated: rr.dateCreated,
          dateOfExpense: rr.dateOfExpense ?? undefined,
          saboId: rr.saboId ?? undefined,
          products: (rr.reimbursementProducts ?? []).map((p: any) => p.name),
          accountCodeName: rr.accountCode?.name ?? ''
        };
      });
      return items;
    }

    case 'fill:start': {
      await storage.setActiveFill(message.payload);
      await chrome.tabs.create({
        url: 'https://us2.concursolutions.com/nui/expense?modal=header&context=new-report'
      });
      return { success: true };
    }

    default:
      return { error: `Unknown message type: ${(message as any).type}` };
  }
}
