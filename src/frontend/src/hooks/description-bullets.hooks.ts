/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQueryClient } from 'react-query';
import { checkDescriptionBullet } from '../apis/description-bullets.api';
import { DescriptionBullet } from 'shared';

/**
 * Custom React hook to check a description bullet.
 */
export const useCheckDescriptionBullet = () => {
  const queryClient = useQueryClient();
  return useMutation<DescriptionBullet, Error, {userId: number, descriptionId: number}>(
    ['description bullets', 'check'],
    async (payload: { userId: number; descriptionId: number }) => {
      const { data } = await checkDescriptionBullet(payload.userId, payload.descriptionId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['work packages']);
      }
    }
  );
};
