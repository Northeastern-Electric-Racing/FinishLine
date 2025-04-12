import { useQuery } from 'react-query';
import { RetrospectiveProjectPreview } from 'shared';
import { getRetrospectiveBudgets, getRetrospectiveTimelines } from '../apis/retrospective.api';

export const useGetRetrospectiveTimelines = () =>
  useQuery<RetrospectiveProjectPreview[], Error>(['retrospective-timelines'], async () => {
    const { data } = await getRetrospectiveTimelines();
    return data;
  });

export const useGetRetrospectiveBudgets = () =>
  useQuery<RetrospectiveProjectPreview[], Error>(['retrospective-budgets'], async () => {
    const { data } = await getRetrospectiveBudgets();
    return data;
  });
