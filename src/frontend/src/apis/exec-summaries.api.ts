import { ExecutiveSummary, VehicleDevelopmentSummary } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
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
