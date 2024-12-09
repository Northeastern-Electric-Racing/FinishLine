import { CreateGraphArgs, FlattenedRelations } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

/**
 * Graph Config
 */
export const getGraphConfig = () => {
  return axios.get<FlattenedRelations[]>(apiUrls.graphConfig(), {
    transformResponse: (data) => JSON.parse(data)
  });
};

export const createGraph = (payload: CreateGraphArgs) => {
  return axios.post(apiUrls.createGraph(), payload);
};
