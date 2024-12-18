import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Checklist, Team, TeamType, User } from 'shared';
import { getAllChecklists, getGeneralChecklists, getUsersChecklists, downloadGoogleImage, editChecklist } from '../apis/onboarding.api';

export interface ChecklistPayload {
  name: string;
  teamType?: TeamType;
  team?: Team;
  descriptions: string[];
  isOptional: boolean;
  subtasks: Checklist[];
  parentChecklist?: Checklist;
  usersChecked: User[];
}

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

export const useEditChecklist = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Checklist, Error, ChecklistPayload>(
    ['checklists', 'edit'],
    async (payload) => {
      const { data } = await editChecklist(payload, id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['checklists']);
      }
    }
  );
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

export const useGetImageUrls = (imageFileIds: (string | null)[]) => {
  return useQuery<string[], Error>(
    ['image', imageFileIds],
    async () => {
      if (!imageFileIds) throw new Error('No image ID provided');
      const imageBlobs = await Promise.all(
        imageFileIds
          .filter((id): id is string => id !== null)
          .map(async (imageId) => {
            const imageBlob = await downloadGoogleImage(imageId);
            return URL.createObjectURL(imageBlob);
          })
      );
      return imageBlobs;
    },
    {
      enabled: !!imageFileIds
    }
  );
};
