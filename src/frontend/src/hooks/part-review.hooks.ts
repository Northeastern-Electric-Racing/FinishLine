import { useMutation, useQuery, useQueryClient } from 'react-query';
import { createPartTag, deletePartTag, getAllPartTags } from '../apis/part-review.api';
import { PartTag } from 'shared';

export interface PartTagPayload {
  name: string;
}

export const useGetAllPartTags = () => {
  return useQuery<PartTag[], Error>(['partTags'], async () => {
    const { data } = await getAllPartTags();
    return data;
  });
};

export const useCreatePartTag = () => {
  const queryClient = useQueryClient();
  return useMutation<PartTag, Error, PartTagPayload>(
    ['partTags', 'create'],
    async (payload) => {
      const { data } = await createPartTag(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['partTags']);
      }
    }
  );
};

export interface DeletePartTagPayload {
  partTagId: string;
}

export const useDeletePartTag = () => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error, DeletePartTagPayload>(
    ['part tag', 'delete'],
    async (deleteTagPayload: DeletePartTagPayload) => {
      const { data } = await deletePartTag(deleteTagPayload.partTagId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['part tag']);
      }
    }
  );
};
