/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**
 * Transforms a date into a string in the format 'YYYY-MM-DD'
 * @param date The date to transform
 * @returns the date as a string in the format 'YYYY-MM-DD'
 */
export const transformDate = (date: Date) => {
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString();
  return `${date.getFullYear().toString()}-${month}-${day}`;
};
