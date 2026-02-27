import type { AuthState, ActiveFill } from './messages';

const AUTH_KEY = 'finishline_auth';
const ACTIVE_FILL_KEY = 'finishline_active_fill';

export const storage = {
  async getAuth(): Promise<AuthState | null> {
    const result = await chrome.storage.local.get(AUTH_KEY);
    return result[AUTH_KEY] ?? null;
  },

  async setAuth(auth: AuthState): Promise<void> {
    await chrome.storage.local.set({ [AUTH_KEY]: auth });
  },

  async clearAuth(): Promise<void> {
    await chrome.storage.local.remove(AUTH_KEY);
  },

  async getActiveFill(): Promise<ActiveFill | null> {
    const result = await chrome.storage.local.get(ACTIVE_FILL_KEY);
    return result[ACTIVE_FILL_KEY] ?? null;
  },

  async setActiveFill(data: ActiveFill): Promise<void> {
    await chrome.storage.local.set({ [ACTIVE_FILL_KEY]: data });
  },

  async clearActiveFill(): Promise<void> {
    await chrome.storage.local.remove(ACTIVE_FILL_KEY);
  }
};
