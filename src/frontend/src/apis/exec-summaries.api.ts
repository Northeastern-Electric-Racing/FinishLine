import { ExecutiveSummary } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { executiveSummaryTransformer } from './transformers/exec-summaries.transformer';

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
