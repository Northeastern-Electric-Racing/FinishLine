/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

export enum TimelineStatus {
  Ahead = 'AHEAD',
  OnTrack = 'ON_TRACK',
  Behind = 'BEHIND',
  VeryBehind = 'VERY_BEHIND'
}

/**
 * Translate every single one of them from enum value to string.
 */
function getReadableTimelineStatus(status: TimelineStatus) {
  switch (status) {
    case TimelineStatus.Ahead:
      return 'Ahead of Schedule';
    case TimelineStatus.OnTrack:
      return 'On Track';
    case TimelineStatus.Behind:
      return 'Behind Schedule';
    case TimelineStatus.VeryBehind:
      return 'Very Behind Schedule';
    default:
      return 'Invalid Status';
  }
}
