import { useCallback, useState } from 'react';

export const RETROSPECTIVE_MODE_STORAGE_KEY = 'gantt-retro-mode';

const readRetrospectiveMode = (): boolean => {
  try {
    return sessionStorage.getItem(RETROSPECTIVE_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

/**
 * Whether the gantt chart is showing the retrospective view. This is a personal view setting, so it's kept in
 * sessionStorage: it survives reloads in the same tab, but doesn't carry over to other tabs, sessions, or users.
 */
export const useRetrospectiveMode = (): [boolean, (isRetro: boolean) => void] => {
  const [isRetro, setIsRetroState] = useState<boolean>(readRetrospectiveMode);

  const setIsRetro = useCallback((value: boolean) => {
    setIsRetroState(value);
    try {
      sessionStorage.setItem(RETROSPECTIVE_MODE_STORAGE_KEY, String(value));
    } catch {
      // storage can be unavailable (e.g. private browsing); the toggle still works for this page view
    }
  }, []);

  return [isRetro, setIsRetro];
};
