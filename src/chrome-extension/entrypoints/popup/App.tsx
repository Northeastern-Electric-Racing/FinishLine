import { useState, useEffect } from 'react';
import type { AuthState, BackgroundMessage, DevUser, RRListItem } from '../../lib/messages';
import { colors, fonts, fontSizes, spacing, mixins } from '../../lib/theme';
import RRList from './RRList';

const IS_DEV = import.meta.env.DEV;

export default function App() {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dev login state
  const [devUsers, setDevUsers] = useState<DevUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');

  // RR list state
  const [rrItems, setRrItems] = useState<RRListItem[]>([]);
  const [rrLoading, setRrLoading] = useState(false);
  const [rrError, setRrError] = useState<string | null>(null);

  useEffect(() => {
    sendMessage({ type: 'auth:check' })
      .then((result) => {
        setAuth(result as AuthState | null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setLoading(false));

    if (IS_DEV) {
      sendMessage({ type: 'auth:users' })
        .then((result) => {
          setDevUsers(result as DevUser[]);
        })
        .catch(() => {});
    }
  }, []);

  // Fetch RR list when authenticated
  useEffect(() => {
    if (!auth) return;
    setRrLoading(true);
    setRrError(null);
    sendMessage({ type: 'rr:list' })
      .then((result) => {
        if (result && typeof result === 'object' && 'error' in (result as any)) {
          setRrError((result as any).error);
        } else {
          setRrItems(result as RRListItem[]);
        }
      })
      .catch((err) => {
        setRrError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setRrLoading(false));
  }, [auth]);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const message: BackgroundMessage = IS_DEV
        ? { type: 'auth:login', payload: { userId: selectedUserId } }
        : { type: 'auth:login:google' };
      const result = (await sendMessage(message)) as AuthState | { error: string };
      if ('error' in result) {
        setError(result.error);
      } else {
        setAuth(result);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await sendMessage({ type: 'auth:logout' });
    setAuth(null);
    setRrItems([]);
    setRrError(null);
  };

  if (loading) {
    return (
      <div style={{ ...mixins.body, padding: spacing.lg, fontSize: fontSizes.base }}>
        Loading...
      </div>
    );
  }

  // Not logged in
  if (!auth) {
    return (
      <div style={{ ...mixins.body, padding: spacing.xl }}>
        <Header />

        <p style={{ ...mixins.subtleText, marginBottom: spacing.xl, marginTop: spacing.xs }}>
          Sign in to manage your reimbursement requests.
        </p>

        {IS_DEV ? (
          <>
            <label style={mixins.label}>Select User (dev)</label>
            <select
              style={mixins.select}
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="" disabled>
                Select a user...
              </option>
              {devUsers.map((user) => (
                <option key={user.userId} value={user.userId}>
                  {user.firstName} {user.lastName} ({user.role.toLowerCase()})
                </option>
              ))}
            </select>
            <button style={mixins.primaryButton} onClick={handleLogin} disabled={!selectedUserId}>
              Dev Login
            </button>
          </>
        ) : (
          <button style={mixins.primaryButton} onClick={handleLogin}>
            Sign in with Google
          </button>
        )}

        {error && <p style={{ ...mixins.errorText, marginTop: spacing.md }}>{error}</p>}
      </div>
    );
  }

  // Logged in
  return (
    <div style={{ ...mixins.body, maxHeight: 520, overflowY: 'auto' }}>
      {/* Header bar */}
      <div
        style={{
          background: colors.primary,
          padding: `${spacing.md}px ${spacing.lg}px`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1
        }}
      >
        <h1
          style={{
            fontFamily: fonts.heading,
            fontSize: fontSizes.lg,
            fontWeight: 600,
            color: colors.textOnPrimary,
            margin: 0
          }}
        >
          FinishLine for Concur
        </h1>
        <button
          style={{
            ...mixins.linkButton,
            color: colors.textOnPrimary,
            fontSize: fontSizes.sm,
            opacity: 0.9
          }}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: spacing.lg }}>
        <p style={{ ...mixins.subtleText, marginBottom: spacing.lg }}>
          Logged in as <strong style={{ color: colors.textPrimary }}>{auth.name}</strong>
        </p>

        {rrLoading && (
          <p style={{ ...mixins.subtleText, textAlign: 'center', marginTop: spacing.xl }}>
            Loading reimbursement requests...
          </p>
        )}
        {rrError && <p style={mixins.errorText}>Error: {rrError}</p>}
        {!rrLoading && !rrError && <RRList items={rrItems} />}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md
      }}
    >
      <div
        style={{
          width: 6,
          height: 28,
          background: colors.primary,
          borderRadius: 3
        }}
      />
      <h1
        style={{
          ...mixins.heading,
          fontSize: fontSizes.xl
        }}
      >
        FinishLine for Concur
      </h1>
    </div>
  );
}

function sendMessage(message: BackgroundMessage): Promise<unknown> {
  return chrome.runtime.sendMessage(message);
}
