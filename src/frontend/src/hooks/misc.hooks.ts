/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery } from 'react-query';
import { VersionObject } from '../utils/types';
import { getReleaseInfo } from '../apis/misc.api';
import { useHistory } from 'react-router-dom';
import { useState, useEffect } from 'react';

export const useGetVersionNumber = () => {
  return useQuery<VersionObject, Error>(['version'], async () => {
    const { data } = await getReleaseInfo();
    return data;
  });
};

export const useHistoryState = <T>(key: string, initialValue: T): [T, (t: T) => void] => {
  const history = useHistory();
  const [rawState, rawSetState] = useState<T>(() => {
    const value = (history.location.state as any)?.[key];
    return value ?? initialValue;
  });
  function setState(value: T) {
    history.replace({
      ...history.location,
      state: {
        ...(history.location.state as object),
        [key]: value
      }
    });
    rawSetState(value);
  }
  return [rawState, setState];
};

export const usePersistForm = <T>(value: T, localStorageKey: string) => {
  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(value));
  }, [value, localStorageKey]);

  return;
};
