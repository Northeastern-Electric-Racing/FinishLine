/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**
 * Add the given number of weeks to the given date and return the outcome.
 * @param start the start date
 * @param days the number of weeks to add to the start date
 * @returns the outcome of adding the weeks to the start date
 */
const addWeeksToDate = (start: Date, weeks: number) => addDaysToDate(start, weeks * 7);

/**
 * Add the given number of days to the given date and return the outcome.
 * @param start the start date
 * @param days the number of days to add to the start date
 * @returns the outcome of adding the days to the start date
 */
const addDaysToDate = (start: Date, days: number) => {
  const end = new Date(start);
  end.setDate(start.getDate() + days);
  return end;
};

/**
 * Returns the day of the given date.
 * Note: this is not the day of the week. For example, 04/21/2023 is day 19468 and 04/22/2023 is day 19469
 * @param date the given date to get the day of
 * @returns the day of the date
 */
const getDay = (date: Date): number => {
  return Math.round(date.getTime() / (1000 * 60 * 60 * 24));
};

/**
 * Calculate the days between two dates
 */
const daysBetween = (date1: Date, date2: Date): number => {
  return Math.round((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
};

export { addWeeksToDate, addDaysToDate, getDay, daysBetween };
