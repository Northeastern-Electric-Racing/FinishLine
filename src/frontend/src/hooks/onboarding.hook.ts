import { useQuery } from 'react-query';
import { Checklist } from 'shared';
import { getAllChecklists, getGeneralChecklists, getUsersChecklists, downloadGoogleImage } from '../apis/onboarding.api';

export const useAllChecklists = () => {
  return useQuery<Checklist[], Error>(['checklists'], async () => {
    const { data } = await getAllChecklists();
    return data;
  });
};

export const useGeneralChecklists = () => {
  return useQuery<Checklist[], Error>(['checklists', 'general'], async () => {
    const { data } = await getGeneralChecklists();
    return data;
  });
};

export const useUsersTeamTypeChecklists = () => {
  return useQuery<Checklist[], Error>(['checklists', 'teamTypeChecklists'], async () => {
    const { data } = await getUsersChecklists();
    return data;
  });
};

export const useGetImageUrl = (imageFileId: string | null) => {
  return useQuery<string, Error>(
    ['image', imageFileId],
    async () => {
      if (!imageFileId) throw new Error('No image ID provided');
      const imageBlob = await downloadGoogleImage(imageFileId);
      return URL.createObjectURL(imageBlob);
    },
    {
      enabled: !!imageFileId
    }
  );
};
