import { useMutation, useQuery, useQueryClient } from 'react-query';
import { PopUp } from 'shared';
import { getPopUps, removePopUps } from '../apis/pop-ups.api';

/**
 * Curstom react hook to get all unread notifications from a user
 * @param userId id of user to get unread notifications from
 * @returns
 */
export const useCurrentUserPopUps = () => {
  return useQuery<PopUp[], Error>(['pop-ups', 'current-user'], async () => {
    const { data } = await getPopUps();
    return data;
  });
};

/**
 * Curstom react hook to remove a notification from a user's unread notifications
 * @param userId id of user to get unread notifications from
 * @returns
 */
export const useRemoveUserPopUp = () => {
  const queryClient = useQueryClient();
  return useMutation<PopUp[], Error, PopUp>(
    ['pop-ups', 'current-user', 'remove'],
    async (popUp: PopUp) => {
      const { data } = await removePopUps(popUp.popUpId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['pop-ups', 'current-user']);
      }
    }
  );
};
