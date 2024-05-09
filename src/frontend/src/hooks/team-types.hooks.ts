/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useQueryClient, useMutation } from 'react-query';
import { setTeamType } from '../apis/team-types.api';

export const useSetTeamType = (teamId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, string>(
    ['team types', 'edit'],
    async (teamTypeId: string) => {
      const { data } = await setTeamType(teamId, teamTypeId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['team types']);
      }
    }
  );
};
