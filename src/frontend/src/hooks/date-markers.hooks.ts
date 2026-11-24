import { useMutation, useQuery, useQueryClient } from 'react-query';
import { BaseDateMarker, DateMarkerArgs } from 'shared';
import { getAllDateMarkers, postCreateDateMarker, postDeleteDateMarker, postEditDateMarker } from '../apis/date-markers.api';
import { useToast } from './toasts.hooks';

export const DATE_MARKERS_KEY = ['date-markers'] as const;

/**
 * Custom React Hook to get all of the organization's date markers.
 */
export const useAllDateMarkers = () => {
  return useQuery<BaseDateMarker[], Error>(DATE_MARKERS_KEY, async () => {
    const { data } = await getAllDateMarkers();
    return data;
  });
};

/**
 * Custom React Hook to create a date marker.
 */
export const useCreateDateMarker = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<void, Error, DateMarkerArgs>(
    async (payload) => {
      await postCreateDateMarker(payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(DATE_MARKERS_KEY);
        toast.success('Date marker created successfully!');
      },
      onError: (error) => {
        toast.error(error.message, 5000);
      }
    }
  );
};

/**
 * Custom React Hook to edit a date marker.
 * @param dateMarkerId the id of the date marker to edit
 */
export const useEditDateMarker = (dateMarkerId: string) => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<void, Error, DateMarkerArgs>(
    async (payload) => {
      await postEditDateMarker(dateMarkerId, payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(DATE_MARKERS_KEY);
        toast.success('Date marker updated successfully!');
      },
      onError: (error) => {
        toast.error(error.message, 5000);
      }
    }
  );
};

/**
 * Custom React Hook to delete a date marker.
 */
export const useDeleteDateMarker = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<void, Error, string>(
    async (dateMarkerId) => {
      await postDeleteDateMarker(dateMarkerId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(DATE_MARKERS_KEY);
        toast.success('Date marker deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.message, 5000);
      }
    }
  );
};
