import { storage } from './storage';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : 'https://finishlinebyner.com';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const auth = await storage.getAuth();
  if (!auth) throw new Error('Not authenticated');

  const authHeader = auth.mode === 'dev' ? auth.userId : `Bearer ${auth.jwt}`;

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
      organizationId: auth.organizationId,
      ...options.headers
    }
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
