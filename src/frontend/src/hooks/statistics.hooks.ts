import { useMutation } from 'react-query';
import { CreateGraphArgs } from 'shared';
import { createGraph } from '../apis/statistics.api';

/**
 * Custom react hook to create a graph
 *
 * @returns A mutation function that allows you to create a graph
 */
export const useCreateGraph = () => {
  return useMutation([], async (args: CreateGraphArgs) => {
    const { data } = await createGraph(args);
    return data;
  });
};
