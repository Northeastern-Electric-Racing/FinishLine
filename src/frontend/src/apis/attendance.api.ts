import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { MeetingAttendance } from 'shared';

export const postTakeAttendance = (payload: { teamId: string; message: string }) => {
  return axios.post<MeetingAttendance>(apiUrls.attendanceTakeAttendance(), payload, {
    transformResponse: (data) => JSON.parse(data) as MeetingAttendance
  });
};

export const getAllAttendances = () => {
  return axios.get<MeetingAttendance[]>(apiUrls.attendanceGetAll(), {
    transformResponse: (data) => JSON.parse(data) as MeetingAttendance[]
  });
};

export const getCheckChannelName = (teamId: string) => {
  return axios.get<{ channelName: string | undefined; valid: boolean }>(apiUrls.attendanceCheckChannel(teamId), {
    transformResponse: (data) => JSON.parse(data) as { channelName: string | undefined; valid: boolean }
  });
};

export const getOngoingAttendance = (teamId: string) => {
  return axios.get<MeetingAttendance | null>(apiUrls.attendanceGetOngoing(teamId), {
    transformResponse: (data) => JSON.parse(data) as MeetingAttendance | null
  });
};

export const postCloseAttendance = (teamId: string) => {
  return axios.post(apiUrls.attendanceCloseOngoing(teamId));
};
