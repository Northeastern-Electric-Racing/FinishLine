import { useMutation, useQuery, useQueryClient } from 'react-query';
import { CreateGraphArgs, Graph, GraphCollection, GraphCollectionFormInput } from 'shared';
import {
  createGraph,
  createGraphCollection,
  deleteGraphCollection,
  getAllGraphCollections,
  getSingleGraph,
  getSingleGraphCollection,
  removeGraphFromCollection,
  updateGraph,
  updateGraphCollection
} from '../apis/statistics.api';

/**
 * Custom react hook to create a graph
 *
 * @returns A mutation function that allows you to create a graph
 */
export const useCreateGraph = () => {
  return useMutation<Graph, Error, CreateGraphArgs>([], async (args: CreateGraphArgs) => {
    const { data } = await createGraph(args);
    return data;
  });
};

/**
 * Custom react hook to retrieve all graph collections
 *
 * @returns A query function that will contain the graph collections
 */
export const useGetAllGraphCollections = () => {
  return useQuery<GraphCollection[], Error>(['graph-collections'], async () => {
    const { data } = await getAllGraphCollections();
    return data;
  });
};

/**
 * Custom react hook to get a single graph collection
 *
 * @param id The id of the graph collection to retrieve
 * @returns Query function that wil contain the graph collection
 */
export const useGetSingleGraphCollection = (id: string) => {
  return useQuery<GraphCollection, Error>(['graph-collections', id], async () => {
    const { data } = await getSingleGraphCollection(id);
    return data;
  });
};

/**
 * Custom react hook to create a graph collection
 *
 * @returns Mutation function that takes in form input to create a graph collection
 */
export const useCreateGraphCollection = () => {
  const queryClient = useQueryClient();
  return useMutation<GraphCollection, Error, GraphCollectionFormInput>(
    [],
    async (args: GraphCollectionFormInput) => {
      const { data } = await createGraphCollection(args);
      return data;
    },
    {
      onSuccess: () => queryClient.invalidateQueries('graph-collections')
    }
  );
};

/**
 * Custom react hook to retrieve a graph by id
 *
 * @param id The id of the graph to retrieve
 * @returns Query function that contains the fetched graph
 */
export const useGetSingleGraph = (id: string) => {
  return useQuery<Graph, Error>(['graph', id], async () => {
    const { data } = await getSingleGraph(id);
    return data;
  });
};

/**
 * Custom react hook to update the given graph with the id
 *
 * @param id The id of the graph to update
 * @returns Mutation function to update the graph, when completed contains the updated graph
 */
export const useUpdateGraph = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Graph, Error, CreateGraphArgs>(
    [],
    async (args: CreateGraphArgs) => {
      const { data } = await updateGraph(id, args);
      return data;
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['graph-collections'])
    }
  );
};

/**
 * Custom react hook to update a graph collection
 *
 * @param id The id of the graph collection to update
 * @returns Mutation function to update the graph collection with the given id
 */
export const useUpdateGraphCollection = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<GraphCollection, Error, GraphCollectionFormInput>(
    [],
    async (args: GraphCollectionFormInput) => {
      const { data } = await updateGraphCollection(id, args);
      return data;
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['graph-collections', id])
    }
  );
};

/**
 * Custom react hook to remove a graph from a graph collection
 *
 * @param collectionId The id of the graph collection to update
 * @param graphId The id of the graph to remove from the collection
 * @returns Mutation function to remove the graph from the collection
 */
export const useRemoveGraphFromCollection = (collectionId: string, graphId: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error>(
    [],
    async () => {
      const { data } = await removeGraphFromCollection(collectionId, graphId);
      return data;
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['graph-collections', collectionId])
    }
  );
};

/**
 * Custom react hook to delete a graph collection
 *
 * @param id The id of the graph collection to delete
 * @returns Mutation function to delete the graph collection with the given id
 */
export const useDeleteGraphCollection = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<{ message: string }, Error>(
    [],
    async () => {
      const { data } = await deleteGraphCollection(id);
      return data;
    },
    {
      onSuccess: () => queryClient.invalidateQueries(['graph-collections'])
    }
  );
};
