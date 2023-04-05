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

export { addWeeksToDate, addDaysToDate };
