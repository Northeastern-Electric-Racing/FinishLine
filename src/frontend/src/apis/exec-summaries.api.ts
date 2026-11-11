import {
  BudgetSummary,
  CompetitionDocumentsSummary,
  EditCompetitionDocumentsSummaryArgs,
  ExecutiveSummary,
  VehicleDevelopmentSummary
} from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { EditExecSummaryPayload } from '../hooks/exec-summaries.hooks';
import {
  competitionDocumentsSummaryTransformer,
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
 * @param teamTypeId optional id of a team type to filter the budget down to
 * @returns the budget summary
 */
export const getBudgetSummary = (id: string, teamTypeId?: string) => {
  return axios.get<BudgetSummary>(apiUrls.executiveSummaryBudget(id), {
    params: teamTypeId ? { teamTypeId } : undefined
  });
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
 * Edits the competition documents summary of an executive summary
 *
 * @param executiveSummaryId id of the executive summary
 * @param payload the edited competition documents summary data
 * @returns the updated competition documents summary
 */
export const editCompetitionDocumentsSummary = (
  executiveSummaryId: string,
  payload: EditCompetitionDocumentsSummaryArgs
) => {
  return axios.post<CompetitionDocumentsSummary>(
    apiUrls.executiveSummaryCompetitionDocumentsSummaryEdit(executiveSummaryId),
    payload,
    { transformResponse: (data) => competitionDocumentsSummaryTransformer(JSON.parse(data)) }
  );
};
