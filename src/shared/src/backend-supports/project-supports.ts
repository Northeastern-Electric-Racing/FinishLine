/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { WbsElementStatus } from '../types/project-types';
import { TimelineStatus } from '../types/work-package-types';

/**
 * This function calculates the end date.
 * @param start the start date
 * @param weeks number of weeks
 * @returns the start date after the weeks have passed
 */
const calculateEndDate = (start: Date, weeks: number) => {
  const end = new Date(start);
  end.setDate(start.getDate() + weeks * 7);
  return end;
};

/**
 * This symbol function calculates the duration
 * @param wps an array of work packages
 * @returns the duration of the project in weeks
 */
const calculateDuration = (wps: { duration: number; startDate: Date }[]) => {
  if (wps.length === 0) return 0;
  if (wps.length === 1) return wps[0].duration;
  const minStart = Math.min(...wps.map((wp) => wp.startDate.getTime()));
  const maxEnd = Math.max(
    ...wps.map((wp) => calculateEndDate(wp.startDate, wp.duration).getTime())
  );
  const durationWeeks = Math.round((maxEnd - minStart) / (1000 * 60 * 60 * 24 * 7));
  return durationWeeks;
};

const calculatePercentExpectedProgress = (start: Date, weeks: number, status: String) => {
  if (status === WbsElementStatus.Inactive) {
    return 0;
  } else if (status === WbsElementStatus.Complete) {
    return 100;
  }
  const currentDate = new Date();
  const elapsedTime = currentDate.getTime() - start.getTime();
  const elapsedDays = elapsedTime / (1000 * 60 * 60 * 24);
  const percentProgress = (elapsedDays * 100) / (weeks * 7);
  return Math.min(Math.round(percentProgress), 100);
};

/**
 * Calculates a status of how current progress compares to expected progress.
 *
 * @param progress The reported progress, as a percentage.
 * @param expectedProgress The expected progress, as a percentage.
 * @returns The status of the progress compared to expectation.
 */
const calculateTimelineStatus = (progress: number, expectedProgress: number): TimelineStatus => {
  const delta = progress - expectedProgress;
  if (delta > 25) {
    return TimelineStatus.Ahead;
  } else if (delta >= 0) {
    return TimelineStatus.OnTrack;
  } else if (delta >= -25) {
    return TimelineStatus.Behind;
  }
  return TimelineStatus.VeryBehind;
};

export {
  calculateDuration,
  calculateEndDate,
  calculatePercentExpectedProgress,
  calculateTimelineStatus
};
