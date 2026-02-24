import type { AuthState } from './messages';

const AUTH_KEY = 'finishline_auth';

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
  }
};
