/**
 * Returns monday of current week
 * @param date date for modify
 */
export const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const newDate = new Date(date.getTime());
  return new Date(newDate.setDate(diff));
};

export const daysOverdue = (deadline: Date) => {
  return Math.round((new Date().getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Determines whether the provided date is before today's date
 * @param startDate the first Date object
 * @param endDate the second Date object
 * @returns true if the end date date comes after the start date and false otherwise
 */
export const isPastEvent = (startDate: Date, endDate: Date) => {
  return startDate < endDate;
};
