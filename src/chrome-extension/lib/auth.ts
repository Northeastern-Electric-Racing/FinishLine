import type { AuthState, DevUser } from './messages';

const API_BASE = import.meta.env.DEV ? 'http://localhost:3001' : 'https://finishlinebyner.com';

export async function fetchDevUsers(): Promise<DevUser[]> {
  const response = await fetch(`${API_BASE}/users`);

  if (!response.ok) {
    throw new Error(`Failed to fetch users (${response.status})`);
  }

  const users: DevUser[] = await response.json();

  return users.sort((a, b) => {
    const roleDiff = rankRole(b.role) - rankRole(a.role);
    if (roleDiff !== 0) return roleDiff;
    const lastDiff = a.lastName.localeCompare(b.lastName);
    if (lastDiff !== 0) return lastDiff;
    return a.firstName.localeCompare(b.firstName);
  });
}

function rankRole(role: string): number {
  switch (role) {
    case 'APP_ADMIN': return 6;
    case 'ADMIN': return 5;
    case 'HEAD': return 4;
    case 'LEADERSHIP': return 3;
    case 'MEMBER': return 2;
    default: return 1;
  }
}

interface LoginResponse {
  userId: string;
  firstName: string;
  lastName: string;
  organizations: string[];
  token?: string;
}

export async function loginDev(userId: string): Promise<AuthState> {
  const response = await fetch(`${API_BASE}/users/auth/login/dev`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Dev login failed (${response.status}): ${text}`);
  }

  const data: LoginResponse = await response.json();

  if (!data.organizations.length) {
    throw new Error('User has no organizations');
  }

  return {
    mode: 'dev',
    userId: data.userId,
    name: `${data.firstName} ${data.lastName}`,
    organizationId: data.organizations[0]
  };
}

export async function loginProd(): Promise<AuthState> {
  const idToken = await getGoogleIdToken();

  const response = await fetch(`${API_BASE}/users/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_token: idToken })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Login failed (${response.status}): ${text}`);
  }

  const data: LoginResponse = await response.json();

  if (!data.token) {
    throw new Error('No token in login response');
  }

  if (!data.organizations.length) {
    throw new Error('User has no organizations');
  }

  return {
    mode: 'prod',
    jwt: data.token,
    userId: data.userId,
    name: `${data.firstName} ${data.lastName}`,
    organizationId: data.organizations[0]
  };
}

async function getGoogleIdToken(): Promise<string> {
  const clientId = import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID;
  if (!clientId) {
    throw new Error('VITE_GOOGLE_AUTH_CLIENT_ID not configured');
  }

  const redirectUrl = chrome.identity.getRedirectURL();
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUrl);
  authUrl.searchParams.set('response_type', 'id_token');
  authUrl.searchParams.set('scope', 'openid email profile');
  authUrl.searchParams.set('nonce', crypto.randomUUID());

  const responseUrl = await chrome.identity.launchWebAuthFlow({
    url: authUrl.toString(),
    interactive: true
  });

  if (!responseUrl) {
    throw new Error('Auth flow cancelled');
  }

  const hash = new URL(responseUrl).hash.substring(1);
  const params = new URLSearchParams(hash);
  const idToken = params.get('id_token');

  if (!idToken) {
    throw new Error('No id_token in auth response');
  }

  return idToken;
}
