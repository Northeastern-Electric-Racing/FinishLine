import { useMutation, useQuery, useQueryClient } from 'react-query';
import { MeetingAttendance, MeetingAttendanceWithAttendees } from 'shared';
import {
  getAllAttendances,
  getAttendanceById,
  getCheckChannelName,
  getOngoingAttendance,
  postCloseAttendance,
  postTakeAttendance
} from '../apis/attendance.api';

const ATTENDANCE_KEY = ['attendances'] as const;

export const useTakeAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation<MeetingAttendance, Error, { teamId: string; message: string }>(
    ({ teamId, message }) => postTakeAttendance({ teamId, message }).then((res) => res.data),
    {
      onSuccess: (_, { teamId }) => {
        queryClient.invalidateQueries(ATTENDANCE_KEY);
        queryClient.invalidateQueries(['attendance-ongoing', teamId]);
      }
    }
  );
};

export const useAllAttendances = () => {
  return useQuery<MeetingAttendance[], Error>(ATTENDANCE_KEY, () => getAllAttendances().then((res) => res.data));
};

export const useCheckChannelName = (teamId: string, enabled: boolean) => {
  return useQuery<{ channelName: string | undefined; valid: boolean }, Error>(
    ['attendance-check-channel', teamId],
    () => getCheckChannelName(teamId).then((res) => res.data),
    { enabled }
  );
};

export const useOngoingAttendance = (teamId: string) => {
  return useQuery<MeetingAttendance | null, Error>(['attendance-ongoing', teamId], () =>
    getOngoingAttendance(teamId).then((res) => res.data)
  );
};

export const useAttendanceById = (meetingAttendanceId: string, enabled: boolean) => {
  return useQuery<MeetingAttendanceWithAttendees, Error>(
    ['attendance', meetingAttendanceId],
    () => getAttendanceById(meetingAttendanceId).then((res) => res.data),
    { enabled }
  );
};

export const useCloseAttendance = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>((teamId) => postCloseAttendance(teamId).then(() => undefined), {
    onSuccess: (_, teamId) => {
      queryClient.invalidateQueries(ATTENDANCE_KEY);
      queryClient.invalidateQueries(['attendance-ongoing', teamId]);
    }
  });
};
