/**
 * Determines if the two dates are in bufferDays distance from each other
 *
 * @param scheduledDate Current date scheduled.
 * @param newDate New date scheduled for a later date from the scheduledDate.
 * @param bufferDays The number of days apart the two days can be
 */
export const isWithinBuffer = (scheduledDate: Date, newDate: Date, bufferDays: number) => {
  const UTCScheduledDate = Date.UTC(scheduledDate.getFullYear(), scheduledDate.getMonth(), scheduledDate.getDate());
  const UTCNewDate = Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());

  const millisecondDifference = UTCNewDate - UTCScheduledDate;
  const dayDifference = Math.floor(Math.abs(millisecondDifference / (1000 * 3600 * 24)));
  return bufferDays > dayDifference;
};
