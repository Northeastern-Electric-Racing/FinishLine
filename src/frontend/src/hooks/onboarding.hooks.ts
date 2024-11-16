import { useQuery } from 'react-query';
import { Checklist } from 'shared';
import { getAllChecklists } from '../apis/onboarding.api';

export const useAllChecklists = () => {
  return useQuery<Checklist[], Error>(['checklists'], async () => {
    const { data } = await getAllChecklists();
    return data;
  });
};
