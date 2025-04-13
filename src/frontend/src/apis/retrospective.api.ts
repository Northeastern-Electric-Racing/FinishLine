import { RetrospectiveProjectPreview } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { retrospectiveProjectPreviewTransformer } from './transformers/projects.transformers';

export const getRetrospectiveTimelines = (startDate?: Date, endDate?: Date) => {
  return axios.get<RetrospectiveProjectPreview[]>(apiUrls.retrospectiveTimelines(startDate, endDate), {
    transformResponse: (data) => JSON.parse(data).map(retrospectiveProjectPreviewTransformer)
  });
};

export const getRetrospectiveBudgets = () => {
  return axios.get<RetrospectiveProjectPreview[]>(apiUrls.retrospectiveBudgets(), {
    transformResponse: (data) => JSON.parse(data).map(retrospectiveProjectPreviewTransformer)
  });
};
