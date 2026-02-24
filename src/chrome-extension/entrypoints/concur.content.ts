import { fillField } from '../lib/concur/filler';
import { detectConcurExpenseForm } from '../lib/concur/detector';
import type { ContentMessage, FillFieldResult, CheckPageResult } from '../lib/messages';

export default defineContentScript({
  matches: [
    'https://www.concursolutions.com/*',
    'https://us2.concursolutions.com/*',
    'https://*.concursolutions.com/*'
  ],
  main() {
    console.log('[FinishLine] Content script loaded on Concur page');

    chrome.runtime.onMessage.addListener(
      (message: ContentMessage, _sender, sendResponse: (response: FillFieldResult | CheckPageResult) => void) => {
        switch (message.type) {
          case 'fill-field': {
            const { selector, value } = message.payload;
            const result = fillField(selector, value);
            console.log(`[FinishLine] Fill field ${selector}:`, result);
            sendResponse(result);
            break;
          }
          case 'check-page': {
            sendResponse({ isConcurForm: detectConcurExpenseForm() });
            break;
          }
        }
        return true;
      }
    );

    // Notify that the content script is ready
    chrome.runtime.sendMessage({ type: 'content-script-ready' });
  }
});
