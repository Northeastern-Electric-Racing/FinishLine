import { useMutation, useQuery, useQueryClient } from 'react-query';
import { createPartTag, getAllPartTags } from '../apis/part-tags.api';

export interface CreatePartTagPayload {
  name: string;
}

export const useGetAllPartTags = () => {
  return useQuery<PartTag[], Error>(['partTags'], async () => {
    const { data } = await getAllPartTags();
    return data;
  });
};

export const useCreatePartTags = () => {
  const queryClient = useQueryClient();
  return useMutation<PartTag, Error, CreatePartTagPayload>(
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
