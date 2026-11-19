import { useQuery } from 'react-query';
import { RetrospectiveProject } from 'shared';
import { getRetrospectiveTimelines } from '../apis/retrospective.api';

export const useGetRetrospectiveTimelines = (startDate?: Date, endDate?: Date, enabled: boolean = true) =>
  useQuery<RetrospectiveProject[], Error>(
    ['retrospective-timelines', startDate, endDate],
    async () => {
      const { data } = await getRetrospectiveTimelines(startDate, endDate);
      return data;
    },
    { enabled }
  );
