import { fillField, fillReportHeader } from '../lib/concur/filler';
import { detectConcurExpenseForm } from '../lib/concur/detector';
import type { ContentMessage, FillFieldResult, CheckPageResult } from '../lib/messages';

const ACTIVE_FILL_KEY = 'finishline_active_fill';

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

    // Auto-fill: check for active fill data and fill the report header
    tryAutoFill();
  }
});

async function tryAutoFill(): Promise<void> {
  try {
    const result = await chrome.storage.local.get(ACTIVE_FILL_KEY);
    const activeFill = result[ACTIVE_FILL_KEY];
    if (!activeFill) {
      console.log('[FinishLine] No active fill data found');
      return;
    }

    // Check if we're on the create-report form
    const url = window.location.href;
    const isCreateReport = url.includes('modal=header') || url.includes('context=new-report');
    if (!isCreateReport) {
      console.log('[FinishLine] Not on create-report form, skipping auto-fill');
      return;
    }

    console.log('[FinishLine] Active fill data found, waiting for form to render...');

    // Wait for the form to render (poll for the report name input up to 5s)
    const formReady = await pollForSelector('input[data-nuiexp="field-name"]', 5000, 200);
    if (!formReady) {
      console.warn('[FinishLine] Form did not render within 5s, skipping auto-fill');
      return;
    }

    console.log('[FinishLine] Form detected, filling report header...');
    const results = await fillReportHeader(activeFill);
    console.log('[FinishLine] Fill results:', results);

    // Do NOT clear active fill — Phase 3 needs it for line items
  } catch (err) {
    console.error('[FinishLine] Auto-fill error:', err);
  }
}

function pollForSelector(selector: string, timeoutMs: number, intervalMs: number): Promise<Element | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const el = document.querySelector(selector);
      if (el) {
        resolve(el);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        resolve(null);
        return;
      }
      setTimeout(check, intervalMs);
    };
    check();
  });
}
