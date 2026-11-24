import { BaseDateMarker, DateMarkerArgs, dateToMidnightUTC } from 'shared';
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { baseDateMarkerTransformer } from './transformers/date-markers.transformer';

/**
 * Gets all of the organization's date markers, sorted by date.
 */
export const getAllDateMarkers = () => {
  return axios.get<BaseDateMarker[]>(apiUrls.dateMarkers(), {
    transformResponse: (data) => (JSON.parse(data) as BaseDateMarker[]).map(baseDateMarkerTransformer)
  });
};

/**
 * Creates a date marker.
 * @param payload the name and date of the new date marker
 */
export const postCreateDateMarker = (payload: DateMarkerArgs) => {
  return axios.post(apiUrls.dateMarkersCreate(), {
    ...payload,
    date: dateToMidnightUTC(payload.date)
  });
};

/**
 * Edits a date marker.
 * @param dateMarkerId the id of the date marker to edit
 * @param payload the new name and date of the date marker
 */
export const postEditDateMarker = (dateMarkerId: string, payload: DateMarkerArgs) => {
  return axios.post(apiUrls.dateMarkerEdit(dateMarkerId), {
    ...payload,
    date: dateToMidnightUTC(payload.date)
  });
};

/**
 * Deletes a date marker.
 * @param dateMarkerId the id of the date marker to delete
 */
export const postDeleteDateMarker = (dateMarkerId: string) => {
  return axios.post(apiUrls.dateMarkerDelete(dateMarkerId));
};
