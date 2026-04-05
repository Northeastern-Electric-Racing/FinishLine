/**
 * Returns monday of current week.
 * @param date date to find the Monday for
 * @param utc if true, uses UTC getters — required for @db.Date values (midnight UTC) to avoid
 *            timezone shift in negative-offset timezones. Pass false (default) for local dates.
 */
export const getMonday = (date: Date, utc = false) => {
  const day = utc ? date.getUTCDay() : date.getDay();
  const dateOfMonth = utc ? date.getUTCDate() : date.getDate();
  const diff = dateOfMonth - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const newDate = new Date(date.getTime());
  if (utc) {
    newDate.setUTCDate(diff);
  } else {
    newDate.setDate(diff);
  }
  return newDate;
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
