import { RetrospectiveProjectPreview } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { retrospectiveProjectPreviewTransformer } from './transformers/projects.transformers';

export const getRetrospectiveTimelines = () => {
  return axios.get<RetrospectiveProjectPreview[]>(apiUrls.retrospectiveTimelines(), {
    transformResponse: (data) => JSON.parse(data).map(retrospectiveProjectPreviewTransformer)
  });
};

export const getRetrospectiveBudgets = () => {
  return axios.get<RetrospectiveProjectPreview[]>(apiUrls.retrospectiveBudgets(), {
    transformResponse: (data) => JSON.parse(data).map(retrospectiveProjectPreviewTransformer)
  });
};
