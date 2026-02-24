/**
 * Detect whether the current page is a Concur expense report form.
 *
 * This is a placeholder — the actual detection logic will be determined
 * after inspecting Concur's DOM structure via Playwright.
 */
export function detectConcurExpenseForm(): boolean {
  const { hostname } = window.location;
  const isConcurDomain =
    hostname.includes('concursolutions.com') || hostname.includes('concur.com');

  if (!isConcurDomain) return false;

  // TODO: Refine detection after inspecting real Concur DOM
  // Look for expense form-specific elements, URL patterns, etc.
  return true;
}
