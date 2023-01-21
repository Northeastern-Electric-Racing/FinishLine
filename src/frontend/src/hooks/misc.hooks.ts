/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQuery } from 'react-query';
import { VersionObject } from '../utils/types';
import { getReleaseInfo } from '../apis/misc.api';

export const useGetVersionNumber = () => {
  return useQuery<VersionObject, Error>(['version'], async () => {
    const { data } = await getReleaseInfo();
    return data;
  });
};
