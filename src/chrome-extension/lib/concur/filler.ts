import type { ActiveFill } from '../messages';

/**
 * Fill a single text/textarea form field on the Concur page.
 *
 * Uses the native value setter + event dispatch pattern to work with
 * React/Angular-managed inputs that ignore direct .value assignments.
 */
export function fillField(selector: string, value: string): { success: boolean; error?: string } {
  const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(selector);
  if (!el) {
    return { success: false, error: `Element not found: ${selector}` };
  }

  // Use the native setter to bypass framework interception
  const nativeSetter = Object.getOwnPropertyDescriptor(
    el instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
    'value'
  )?.set;

  if (!nativeSetter) {
    return { success: false, error: 'Could not get native value setter' };
  }

  nativeSetter.call(el, value);

  // Dispatch events so the page's framework picks up the change
  el.dispatchEvent(new Event('input', { bubbles: true }));
  el.dispatchEvent(new Event('change', { bubbles: true }));
  el.dispatchEvent(new Event('blur', { bubbles: true }));

  return { success: true };
}

/**
 * Fill a Concur combobox (dropdown) field.
 *
 * 1. Find the combobox container by data-nuiexp selector
 * 2. Focus the input inside it, clear it, type the option text
 * 3. Wait for the dropdown/listbox to appear
 * 4. Find and click the matching option
 */
export async function fillCombobox(
  selector: string,
  optionText: string
): Promise<{ success: boolean; error?: string }> {
  const container = document.querySelector(selector);
  if (!container) {
    return { success: false, error: `Combobox container not found: ${selector}` };
  }

  const input = container.querySelector<HTMLInputElement>('input');
  if (!input) {
    return { success: false, error: `Input not found inside combobox: ${selector}` };
  }

  // Focus and clear
  input.focus();
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
  if (!nativeSetter) {
    return { success: false, error: 'Could not get native value setter' };
  }

  nativeSetter.call(input, '');
  input.dispatchEvent(new Event('input', { bubbles: true }));

  // Type the option text
  nativeSetter.call(input, optionText);
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));

  // Poll for dropdown/listbox to appear (up to 2s)
  const option = await pollForElement(
    () => {
      const listbox = document.querySelector('[role="listbox"]');
      if (!listbox) return null;
      const options = listbox.querySelectorAll('[role="option"]');
      for (const opt of options) {
        if (opt.textContent?.trim().toLowerCase().includes(optionText.toLowerCase())) {
          return opt as HTMLElement;
        }
      }
      return null;
    },
    2000,
    100
  );

  if (!option) {
    // Dismiss any open dropdown by blurring
    input.dispatchEvent(new Event('blur', { bubbles: true }));
    return { success: false, error: `Option "${optionText}" not found in dropdown for ${selector}` };
  }

  option.click();
  return { success: true };
}

/**
 * Poll for an element to appear in the DOM.
 */
function pollForElement<T extends HTMLElement>(
  finder: () => T | null,
  timeoutMs: number,
  intervalMs: number
): Promise<T | null> {
  return new Promise((resolve) => {
    const start = Date.now();
    const check = () => {
      const el = finder();
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

interface FillResult {
  field: string;
  success: boolean;
  error?: string;
}

/**
 * Fill all header fields on the Concur "Create Expense Report" form.
 */
export async function fillReportHeader(data: ActiveFill): Promise<FillResult[]> {
  const results: FillResult[] = [];

  // Report Name
  const reportName = `NER RR #${data.identifier} - ${data.vendorName}`;
  results.push({ field: 'Report Name', ...fillField('input[data-nuiexp="field-name"]', reportName) });

  // Start Date & End Date
  if (data.dateOfExpense) {
    const dateFormatted = formatDateMMDDYYYY(data.dateOfExpense);
    results.push({
      field: 'Start Date',
      ...fillField('input[data-nuiexp="field-startDate"]', dateFormatted)
    });
    results.push({
      field: 'End Date',
      ...fillField('input[data-nuiexp="field-endDate"]', dateFormatted)
    });
  }

  // Comment (product names)
  if (data.products.length > 0) {
    const comment = data.products.join(', ');
    results.push({
      field: 'Comment',
      ...fillField('textarea[data-nuiexp="field-comment"]', comment)
    });
  }

  // Type of Expense (combobox)
  const expenseResult = await fillCombobox('[data-nuiexp="field-custom10"]', 'Domestic');
  results.push({ field: 'Type of Expense', ...expenseResult });

  // Business Purpose (combobox)
  const purposeResult = await fillCombobox(
    '[data-nuiexp="field-custom6"]',
    'Student Related Activities Domestic'
  );
  results.push({ field: 'Business Purpose', ...purposeResult });

  return results;
}

function formatDateMMDDYYYY(dateStr: string): string {
  const d = new Date(dateStr);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}
