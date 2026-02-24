import { useState } from 'react';

/**
 * MVP Popup — lets the user type a CSS selector and value,
 * then sends a message to the content script to fill that field on the Concur page.
 */
export default function App() {
  const [selector, setSelector] = useState('');
  const [value, setValue] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleFill = async () => {
    setStatus('Filling...');
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) {
        setStatus('Error: No active tab');
        return;
      }

      const response = await chrome.tabs.sendMessage(tab.id, {
        type: 'fill-field',
        payload: { selector, value }
      });

      if (response?.success) {
        setStatus('Filled successfully!');
      } else {
        setStatus(`Error: ${response?.error ?? 'Unknown error'}`);
      }
    } catch (err) {
      setStatus(`Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: 16, marginBottom: 12 }}>FinishLine for Concur</h2>
      <p style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
        MVP: Fill a single field on the current Concur page.
      </p>

      <label style={labelStyle}>CSS Selector</label>
      <input
        style={inputStyle}
        type="text"
        placeholder='e.g. #expenseName'
        value={selector}
        onChange={(e) => setSelector(e.target.value)}
      />

      <label style={labelStyle}>Value</label>
      <input
        style={inputStyle}
        type="text"
        placeholder="Value to fill"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <button
        style={buttonStyle}
        onClick={handleFill}
        disabled={!selector || !value}
      >
        Fill Field
      </button>

      {status && (
        <p style={{
          marginTop: 12,
          fontSize: 13,
          color: status.startsWith('Error') ? '#d32f2f' : '#2e7d32'
        }}>
          {status}
        </p>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  marginBottom: 4,
  color: '#444',
};

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '8px 10px',
  marginBottom: 12,
  border: '1px solid #ccc',
  borderRadius: 4,
  fontSize: 13,
};

const buttonStyle: React.CSSProperties = {
  padding: '8px 16px',
  background: '#ef4444',
  color: '#fff',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
};
