/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { VehicleDevelopmentProjectSummary } from 'shared';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Computes the length of a bar in whole days.
 *
 * @param startDate start of the project
 * @param plannedEndDate planned end of the project
 * @returns the number of days between the two dates, never negative
 */
export const getBarLengthInDays = (startDate: Date, plannedEndDate: Date): number => {
  return Math.max(0, Math.round((plannedEndDate.getTime() - startDate.getTime()) / MS_PER_DAY));
};

/**
 * Computes how many days of a project have elapsed as of today, i.e. where the dotted "today" marker
 * sits on the project's bar. This is clamped to [0, bar length], so a project that hasn't started is at 0
 * and a finished one is at its full length.
 */
export const getElapsedDays = (project: VehicleDevelopmentProjectSummary, today: Date): number => {
  const elapsed = Math.round((today.getTime() - project.startDate.getTime()) / MS_PER_DAY);
  return Math.min(getBarLengthInDays(project.startDate, project.plannedEndDate), Math.max(0, elapsed));
};

/**
 * Computes the tick values for the days axis, from 0 up to (at least) the given number of days.
 * The step is chosen from a short list of round numbers so that there are at most ~6 intervals.
 *
 * @param totalDays the last day that has to be covered by the axis
 * @returns ascending tick values starting at 0 and ending at or after totalDays
 */
export const getDaysAxisTicks = (totalDays: number): number[] => {
  const steps = [1, 2, 5, 10, 15, 30, 60, 100, 200, 500, 1000];
  const step = steps.find((s) => totalDays / s <= 6) ?? 1000;
  const ticks: number[] = [];
  for (let day = 0; day < totalDays + step; day += step) {
    ticks.push(day);
    if (day >= totalDays) break;
  }
  return ticks;
};
