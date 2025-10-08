/*
 * Microsoft Clarity React Context Provider
 *
 * This provider injects the Microsoft Clarity analytics script into your app and exposes
 * the Clarity API via React context. Use the `useClarity` hook to access the Clarity function
 * anywhere in your component tree.
 *
 * Usage:
 *   import { useClarity } from './ClarityProvider';
 *   const clarity = useClarity();
 *   clarity('set', 'userId', '123'); // Example Clarity API call
 *
 * The Clarity project ID is read from VITE_REACT_APP_CLARITY_PROJECT_ID in your environment.
 */
import React, { useEffect, createContext, useContext, useCallback } from 'react';

// Extend the Window interface to include the Clarity function
declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

// Your Microsoft Clarity project ID is read from VITE_REACT_APP_CLARITY_PROJECT_ID
const CLARITY_PROJECT_ID = import.meta.env.VITE_REACT_APP_CLARITY_PROJECT_ID as string;

// Type for the Clarity function
type ClarityFn = (...args: any[]) => void;

// Create the Clarity context
export const ClarityContext = createContext<ClarityFn | undefined>(undefined);

/**
 * useClarity hook
 *
 * Returns the Clarity function from context. Use this to call Clarity API methods.
 * Example: const clarity = useClarity();
 */
export const useClarity = () => useContext(ClarityContext);

/**
 * ClarityProvider component
 *
 * Injects the Clarity script on mount and provides the Clarity function via context.
 * Wrap your app with this provider (typically in AppMain.tsx).
 */
const ClarityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Inject the Clarity script only once, if not already present
    if (typeof window !== 'undefined' && !window.clarity) {
      (function (c: any, l: Document, a: string, r: string, i: string) {
        c[a] =
          c[a] ||
          function (...args: any[]) {
            (c[a].q = c[a].q || []).push(args);
          };
        const t = l.createElement(r) as HTMLScriptElement;
        t.async = true;
        t.src = 'https://www.clarity.ms/tag/' + i;
        const [y] = l.getElementsByTagName(r);
        if (y && y.parentNode) {
          y.parentNode.insertBefore(t, y);
        }
      })(window, document, 'clarity', 'script', CLARITY_PROJECT_ID);
    }
  }, []);

  // Memoized clarity function that calls window.clarity if available
  const clarity = useCallback<ClarityFn>((...args) => {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity(...args);
    }
  }, []);

  return <ClarityContext.Provider value={clarity}>{children}</ClarityContext.Provider>;
};

export default ClarityProvider;
