/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  checkDescriptionBullet,
  createDescriptionBulletType,
  editDescriptionBulletType,
  getAllDescriptionBulletTypes
} from '../apis/description-bullets.api';
import { DescriptionBullet, DescriptionBulletType, DescriptionBulletTypeCreatePayload } from 'shared';

export interface CheckDescriptionBulletRequestPayload {
  userId: string;
  descriptionId: string;
}

/**
 * Custom React hook to check a description bullet.
 */
export const useCheckDescriptionBullet = () => {
  const queryClient = useQueryClient();
  return useMutation<DescriptionBullet, Error, CheckDescriptionBulletRequestPayload>(
    ['description bullets', 'check'],
    async (payload: CheckDescriptionBulletRequestPayload) => {
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

export const useGetAllDescriptionBulletTypes = () => {
  return useQuery<DescriptionBulletType[], Error>(['description bullets'], async () => {
    const { data } = await getAllDescriptionBulletTypes();
    return data;
  });
};

export const useCreateDescriptionBulletType = () => {
  const queryClient = useQueryClient();
  return useMutation<DescriptionBulletType, Error, DescriptionBulletTypeCreatePayload>(
    ['description bullets', 'create'],
    async (payload: DescriptionBulletTypeCreatePayload) => {
      const { data } = await createDescriptionBulletType(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['description bullets']);
      }
    }
  );
};

export const useEditDescriptionBulletType = () => {
  const queryClient = useQueryClient();
  return useMutation<DescriptionBulletType, Error, DescriptionBulletTypeCreatePayload>(
    ['description bullets', 'edit'],
    async (payload: DescriptionBulletTypeCreatePayload) => {
      const { data } = await editDescriptionBulletType(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['description bullets']);
      }
    }
  );
};
