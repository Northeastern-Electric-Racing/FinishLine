import { CreateGraphArgs, Graph, GraphCollection, GraphCollectionFormInput } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { graphCollectionTransformer, graphTransformer } from './transformers/statistics.transformers';

export const createGraph = (payload: CreateGraphArgs) => {
  return axios.post<Graph>(apiUrls.createGraph(), payload, {
    transformResponse: (data) => graphTransformer(JSON.parse(data))
  });
};

export const getAllGraphCollections = () => {
  return axios.get<GraphCollection[]>(apiUrls.graphCollections(), {
    transformResponse: (data) => JSON.parse(data).map(graphCollectionTransformer)
  });
};

export const getSingleGraphCollection = (id: string) => {
  return axios.get<GraphCollection>(apiUrls.graphCollectionById(id), {
    transformResponse: (data) => graphCollectionTransformer(JSON.parse(data))
  });
};

export const createGraphCollection = (payload: GraphCollectionFormInput) => {
  return axios.post<GraphCollection>(apiUrls.createGraphCollection(), payload, {
    transformResponse: (data) => graphCollectionTransformer(JSON.parse(data))
  });
};
export const updateGraph = (id: string, payload: CreateGraphArgs) => {
  return axios.post<Graph>(apiUrls.updateGraph(id), payload, {
    transformResponse: (data) => graphTransformer(JSON.parse(data))
  });
};

export const getSingleGraph = (id: string) => {
  return axios.get<Graph>(apiUrls.getGraphById(id), {
    transformResponse: (data) => graphTransformer(JSON.parse(data))
  });
};

export const updateGraphCollection = (id: string, payload: GraphCollectionFormInput) => {
  return axios.post<GraphCollection>(apiUrls.updateGraphCollection(id), payload, {
    transformResponse: (data) => graphCollectionTransformer(JSON.parse(data))
  });
};
