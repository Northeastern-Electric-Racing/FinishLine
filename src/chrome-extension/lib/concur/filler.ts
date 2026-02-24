/**
 * Fill a single form field on the Concur page.
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
