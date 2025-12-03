/*
import { HttpException } from './errors.utils';

export const validateMeetingTimes = (nums: number[]): number[] => {
  if (nums.length === 0) {
    throw new HttpException(400, 'There must be at least one meeting time');
  }

  for (let i = 0; i < nums.length; i++) {
    if (nums[i] < 0 || nums[i] > 11) {
      throw new HttpException(400, 'Meeting times have to be in range 0-11');
    }
    if (i > 0 && nums[i] !== nums[i - 1] + 1) {
      throw new HttpException(400, 'Meeting times have to be consecutive');
    }
  }
  return nums;
};

export const transformStartTime = (times: number[]) => {
  return (times[0] % 12) + 10;
};

export const addHours = (date: Date, hours: number) => {
  const hoursToAdd = hours * 60 * 60 * 1000;
  date.setTime(date.getTime() + hoursToAdd);
  return date;
};
*/
