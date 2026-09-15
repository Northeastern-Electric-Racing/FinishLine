import React, { useEffect, createContext, useCallback } from 'react';

// Extend the Window interface to include the Clarity function
declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

const CLARITY_PROJECT_ID = import.meta.env.VITE_REACT_APP_CLARITY_PROJECT_ID as string | undefined;

export type ClarityFn = (...args: any[]) => void;

export const ClarityContext = createContext<ClarityFn | undefined>(undefined);

/**
 * ClarityProvider component
 *
 * Injects the Clarity script on mount and provides the Clarity function via context.
 */
const ClarityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // Inject the Clarity script only once, if not already present
    if (typeof window !== 'undefined' && !window.clarity && CLARITY_PROJECT_ID) {
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
