import { useMutation, useQuery } from 'react-query';
import { CreateGraphArgs, FlattenedRelations } from 'shared';
import { createGraph, getGraphConfig } from '../apis/statistics.api';

/**
 * Custom React Hook to supply the graph config
 */
export const useGraphConfig = () => {
  return useQuery<FlattenedRelations[], Error>(['graph config'], async () => {
    const { data } = await getGraphConfig();
    return data;
  });
};

export const useCreateGraph = () => {
  return useMutation([], async (args: CreateGraphArgs) => {
    const { data } = await createGraph(args);
    return data;
  });
};
