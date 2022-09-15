/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  createSingleRisk,
  deleteSingleRisk,
  editSingleRisk,
  getRisksForProject
} from '../apis/Risks.api';
import { Risk } from 'shared';

/**
 * Custom React hook to get all risks for a certain project.
 */
export const useGetRisksForProject = (projectId: number) => {
  return useQuery<Risk[], Error>(['risks'], async () => {
    const { data } = await getRisksForProject(projectId);
    return data;
  });
};

/**
 * Custom React hook to create a new risk.
 */
export const useCreateSingleRisk = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['risks', 'create'],
    async (riskPayload: any) => {
      const { data } = await createSingleRisk(riskPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['risks']);
      }
    }
  );
};

/**
 * Custom React hook to edit a risk.
 */

export const useEditSingleRisk = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['risks', 'edit'],
    async (riskPayload: any) => {
      const { data } = await editSingleRisk(riskPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['risks']);
      }
    }
  );
};

/**
 * Custom React hook to delete a risk.
 */

export const useDeleteSingleRisk = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, any>(
    ['risks', 'delete'],
    async (riskPayload: any) => {
      const { data } = await deleteSingleRisk(riskPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['risks']);
      }
    }
  );
};
