import { useQuery } from 'react-query';
import { Checklist } from 'shared';
import { getAllChecklists, getGeneralChecklists, getUsersTeamTypeChecklists } from '../apis/onboarding.api';

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
    const { data } = await getUsersTeamTypeChecklists();
    return data;
  });
};
