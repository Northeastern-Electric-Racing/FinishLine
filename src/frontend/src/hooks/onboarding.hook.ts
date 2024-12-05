import { useQuery } from 'react-query';
import { Checklist } from 'shared';
import { getAllChecklists, getGeneralChecklist, getUsersTeamTypeChecklists } from '../apis/onboarding.api';

export const useAllChecklists = () => {
  return useQuery<Checklist[], Error>(['checklists'], async () => {
    const { data } = await getAllChecklists();
    return data;
  });
};

export const useGeneralChecklist = () => {
  return useQuery<Checklist, Error>(['checklists', 'general'], async () => {
    const { data } = await getGeneralChecklist();
    return data;
  });
}

export const useUsersTeamTypeChecklists = () => {
  return useQuery<Checklist[], Error>(['checklists', 'teamTypeChecklists'], async () => {
    const { data } = await getUsersTeamTypeChecklists();
    return data;
  });
}