import { useQuery } from 'react-query';
import { RetrospectiveProjectPreview } from 'shared';
import { getRetrospectiveBudgets, getRetrospectiveTimelines } from '../apis/retrospective.api';

export const useGetRetrospectiveTimelines = (startDate?: Date, endDate?: Date) =>
  useQuery<RetrospectiveProjectPreview[], Error>(['retrospective-timelines', startDate, endDate], async () => {
    const { data } = await getRetrospectiveTimelines(startDate, endDate);
    return data;
  });

export const useGetRetrospectiveBudgets = () =>
  useQuery<RetrospectiveProjectPreview[], Error>(['retrospective-budgets'], async () => {
    const { data } = await getRetrospectiveBudgets();
    return data;
  });
