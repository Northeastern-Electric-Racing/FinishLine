import { storage } from '../lib/storage';
import type { BackgroundMessage, ContentMessage, FillFieldResult } from '../lib/messages';

export default defineBackground(() => {
  chrome.runtime.onMessage.addListener((message: BackgroundMessage, _sender, sendResponse) => {
    handleMessage(message).then(sendResponse);
    return true; // keep channel open for async response
  });
});

async function handleMessage(message: BackgroundMessage): Promise<unknown> {
  switch (message.type) {
    case 'auth:check':
      return storage.getAuth();

    case 'auth:logout':
      await storage.clearAuth();
      return { success: true };

    case 'fill-field': {
      // Forward fill-field command to the active tab's content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) return { success: false, error: 'No active tab' };

      const contentMessage: ContentMessage = {
        type: 'fill-field',
        payload: (message as any).payload
      };

      return new Promise<FillFieldResult>((resolve) => {
        chrome.tabs.sendMessage(tab.id!, contentMessage, (response: FillFieldResult) => {
          resolve(response ?? { success: false, error: 'No response from content script' });
        });
      });
    }

    default:
      return { error: `Unknown message type: ${(message as any).type}` };
  }
}
