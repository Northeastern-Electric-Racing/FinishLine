import {
  BudgetSummary,
  CompetitionPerformance,
  EditCompetitionPerformanceArgs,
  ExecutiveSummary,
  VehicleDevelopmentSummary
} from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { EditExecSummaryPayload } from '../hooks/exec-summaries.hooks';
import {
  executiveSummaryTransformer,
  vehicleDevelopmentSummaryTransformer
} from './transformers/exec-summaries.transformer';

/**
 * Gets all the executive summaries
 *
 * @returns all the executive summaries
 */
export const getAllExecutiveSummaries = () => {
  return axios.get<ExecutiveSummary[]>(apiUrls.executiveSummaries(), {
    transformResponse: (data) => JSON.parse(data).map(executiveSummaryTransformer)
  });
};

/**
 * Gets a single executive summary
 *
 * @param id the id of the executive summary to get
 * @returns the executive summary with the given id
 */
export const getSingleExecutiveSummary = (id: string) => {
  return axios.get<ExecutiveSummary>(apiUrls.executiveSummaryById(id), {
    transformResponse: (data) => executiveSummaryTransformer(JSON.parse(data))
  });
};

/**
 * Gets the vehicle development data for an executive summary
 *
 * @param id the id of the executive summary
 * @param teamId optional id of a team to filter the projects by
 * @returns the vehicle development summary
 */
export const getVehicleDevelopmentSummary = (id: string, teamId?: string) => {
  return axios.get<VehicleDevelopmentSummary>(apiUrls.executiveSummaryVehicleDevelopment(id), {
    params: teamId ? { teamId } : undefined,
    transformResponse: (data) => vehicleDevelopmentSummaryTransformer(JSON.parse(data))
  });
};

/**
 * Gets the budget summary (budget by division) for an executive summary
 *
 * @param id the id of the executive summary
 * @returns the budget summary
 */
export const getBudgetSummary = (id: string) => {
  return axios.get<BudgetSummary>(apiUrls.executiveSummaryBudget(id));
};

/**
 * Edits an executive summary in the database
 *
 * @param id id of the executive summary
 * @param execSummaryData the edited data of the executive summary
 * @returns the updated executive summary
 */
export const editExecutiveSummary = (id: string, execSummaryData: EditExecSummaryPayload) => {
  return axios.post<ExecutiveSummary>(apiUrls.executiveSummaryEdit(id), execSummaryData, {
    transformResponse: (data) => executiveSummaryTransformer(JSON.parse(data))
  });
};

/**
 * Edits a competition performance in the database.
 *
 * NOTE: this is a full replace, not a patch. Any field omitted from the payload is cleared
 * (set to null) on the server, so the payload must contain every field the form holds.
 *
 * @param competitionPerformanceId id of the competition performance to edit
 * @param competitionPerformanceData the complete edited data of the competition performance
 * @returns the updated competition performance
 */
export const editCompetitionPerformance = (
  competitionPerformanceId: string,
  competitionPerformanceData: EditCompetitionPerformanceArgs
) => {
  return axios.post<CompetitionPerformance>(
    apiUrls.executiveSummaryEditCompetitionPerformance(competitionPerformanceId),
    competitionPerformanceData
  );
};
