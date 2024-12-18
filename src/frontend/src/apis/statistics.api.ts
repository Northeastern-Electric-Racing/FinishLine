import { CreateGraphArgs } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';

export const createGraph = (payload: CreateGraphArgs) => {
  return axios.post(apiUrls.createGraph(), payload);
};
