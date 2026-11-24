import { BaseDateMarker, dbDateToLocalDate } from 'shared';

/**
 * Converts a date marker from the API so its date is a local Date on the same calendar day.
 * The backend stores it as midnight UTC, which would otherwise show as the previous day in US time zones.
 */
export const baseDateMarkerTransformer = (dateMarker: BaseDateMarker): BaseDateMarker => ({
  ...dateMarker,
  date: dbDateToLocalDate(new Date(dateMarker.date))
});
