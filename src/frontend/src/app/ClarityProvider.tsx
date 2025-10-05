import React, { useEffect, createContext, useContext, useCallback } from 'react';

declare global {
  interface Window {
    clarity?: (...args: any[]) => void;
  }
}

const CLARITY_PROJECT_ID = import.meta.env.VITE_REACT_APP_CLARITY_PROJECT_ID as string;
type ClarityFn = (...args: any[]) => void;
export const ClarityContext = createContext<ClarityFn | undefined>(undefined);

export const useClarity = () => useContext(ClarityContext);

const ClarityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
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

  const clarity = useCallback<ClarityFn>((...args) => {
    if (typeof window !== 'undefined' && typeof window.clarity === 'function') {
      window.clarity(...args);
    }
  }, []);

  return <ClarityContext.Provider value={clarity}>{children}</ClarityContext.Provider>;
};

export default ClarityProvider;
