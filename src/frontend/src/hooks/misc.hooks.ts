/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery } from 'react-query';
import { VersionObject } from '../utils/types';
import { getReleaseInfo } from '../apis/misc.api';
import { useHistory } from 'react-router-dom';
import { useContext, useState } from 'react';
import { ClarityContext } from '../app/ClarityProvider';

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

/**
 * useClarity hook
 *
 * Returns the Clarity function from context. Use this to call Clarity API methods.
 * Example: const clarity = useClarity();
 */
export const useClarity = () => {
  const context = useContext(ClarityContext);
  if (context === undefined) {
    throw new Error('useClarity must be used within a ClarityProvider');
  }
  return context;
};
