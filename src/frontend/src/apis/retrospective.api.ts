import { RetrospectiveProject } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { retrospectiveProjectTransformer } from './transformers/projects.transformers';

export const getRetrospectiveTimelines = (startDate?: Date, endDate?: Date) => {
  return axios.get<RetrospectiveProject[]>(apiUrls.retrospectiveTimelines(startDate, endDate), {
    transformResponse: (data) => JSON.parse(data).map(retrospectiveProjectTransformer)
  });
};
