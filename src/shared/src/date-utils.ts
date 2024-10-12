/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Availability } from './types/user-types';

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

const getSaturday = (d: Date): Date => {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -1 : 6); // adjust when day is Sunday
  return new Date(d.setDate(diff));
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  date1 = new Date(date1);
  date2 = new Date(date2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const isWithinSameWeek = (date1: Date, date2: Date): boolean => {
  // Function to find the Saturday of the week for a given date

  // Get the Saturday for both dates
  const saturday1 = getSaturday(new Date(date1));
  const saturday2 = getSaturday(new Date(date2));

  // Check if both dates have the same Saturday
  return (
    saturday1.getFullYear() === saturday2.getFullYear() &&
    saturday1.getMonth() === saturday2.getMonth() &&
    saturday1.getDate() === saturday2.getDate()
  );
};

const getUniqueAvailabilities = (availabilities: Availability[]) => {
  const uniqueAvailabilities: Availability[] = [];
  for (const availability of availabilities) {
    const existingIndex = uniqueAvailabilities.findIndex((a) => isSameDay(a.dateSet, availability.dateSet));
    if (existingIndex === -1) {
      uniqueAvailabilities.push(availability);
    } else {
      uniqueAvailabilities[existingIndex] = availability;
    }
  }
  return uniqueAvailabilities;
};

const getMostRecentAvailabilities = (availabilities: Availability[], startDate: Date): Availability[] => {
  availabilities = getUniqueAvailabilities(availabilities);
  const startDateObj = new Date(startDate);

  const getClosestDate = (availabilities: Availability[], targetDate: Date): Availability => {
    if (availabilities.length < 1)
      return {
        dateSet: targetDate,
        availability: []
      };
    return availabilities.reduce((closest, current) => {
      return Math.abs(current.dateSet.getTime() - targetDate.getTime()) <
        Math.abs(closest.dateSet.getTime() - targetDate.getTime())
        ? current
        : closest;
    }, availabilities[0]);
  };

  const result: Availability[] = [];

  for (let i = 0; i < 7; i++) {
    const targetDate = addDaysToDate(startDateObj, i);

    const sameDayAvailability = availabilities.filter((avail) => avail.dateSet.getDay() === targetDate.getDay());

    const closestAvailability = getClosestDate(sameDayAvailability, targetDate);
    const deepCopy = JSON.parse(JSON.stringify({ ...closestAvailability, dateSet: targetDate })) as Availability; // Deeply copy availability

    result.push({ ...deepCopy, dateSet: new Date(deepCopy.dateSet) });
  }

  return result;
};

const getDayOfWeek = (date: Date) => {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIndex = new Date(date).getDay();
  return daysOfWeek[dayIndex];
};

const getNextSevenDays = (startDate: Date) => {
  const startDateObj = new Date(startDate);
  const dates = [];

  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(startDateObj);
    nextDate.setDate(startDateObj.getDate() + i);
    dates.push(nextDate);
  }

  return dates;
};

export {
  addWeeksToDate,
  addDaysToDate,
  getDay,
  daysBetween,
  isWithinSameWeek,
  getSaturday,
  getMostRecentAvailabilities,
  isSameDay,
  getDayOfWeek,
  getNextSevenDays,
  getUniqueAvailabilities
};
