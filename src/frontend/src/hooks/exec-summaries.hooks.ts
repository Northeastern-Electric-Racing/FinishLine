import { useQuery } from 'react-query';
import { ExecutiveSummary } from 'shared';
import { getAllExecutiveSummaries, getSingleExecutiveSummary } from '../apis/exec-summaries.api';

/**
 * Custom react hook to get all the executive summaries
 *
 * @returns all the executive summaries
 */
export const useGetAllExecutiveSummaries = () => {
  return useQuery<ExecutiveSummary[], Error>(['executive-summaries'], async () => {
    const { data } = await getAllExecutiveSummaries();
    return data;
  });
};

/**
 * Custom react hook to get a single executive summary
 *
 * @param id Id of the executive summary to get
 * @returns the executive summary
 */
export const useSingleExecutiveSummary = (id: string) => {
  return useQuery<ExecutiveSummary, Error>(['executive-summaries', id], async () => {
    const { data } = await getSingleExecutiveSummary(id);
    return data;
  });
};
