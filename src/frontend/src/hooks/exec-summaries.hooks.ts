import { useMutation, useQuery, useQueryClient } from 'react-query';
import { ExecutiveSummary, VehicleDevelopmentSummary } from 'shared';
import {
  editExecutiveSummary,
  getAllExecutiveSummaries,
  getSingleExecutiveSummary,
  getVehicleDevelopmentSummary
} from '../apis/exec-summaries.api';

export interface EditExecSummaryPayload {
  seasonStartDate?: Date;
  seasonEndDate?: Date;
  goals: string;
  winsAndImprovements: string;
  budgetNotes: string;
  recruitmentNotes: string;
}

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

/**
 * Custom react hook to get the vehicle development summary of an executive summary
 *
 * @param id Id of the executive summary
 * @param teamId optional id of a team to filter the projects by
 * @returns the vehicle development summary
 */
export const useVehicleDevelopmentSummary = (id: string, teamId?: string) => {
  return useQuery<VehicleDevelopmentSummary, Error>(['executive-summaries', id, 'vehicle-development', teamId], async () => {
    const { data } = await getVehicleDevelopmentSummary(id, teamId);
    return data;
  });
};

/**
 * Custom React Hook to edit an executive summary.
 *
 * @param executiveSummaryId The id of the executive summary being edited
 * @returns the edited executive summary
 */
export const useEditExecutiveSummary = (executiveSummaryId: string) => {
  const queryClient = useQueryClient();
  return useMutation<ExecutiveSummary, Error, EditExecSummaryPayload>(
    ['executive-summaries', 'edit'],
    async (formData: EditExecSummaryPayload) => {
      const { data } = await editExecutiveSummary(executiveSummaryId, formData);
      queryClient.invalidateQueries(['executive-summaries']);
      return data;
    }
  );
};
