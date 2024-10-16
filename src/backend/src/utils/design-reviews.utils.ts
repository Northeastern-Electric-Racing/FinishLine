import { DesignReview } from 'shared';
import { HttpException } from './errors.utils';
import { User } from '@prisma/client';

/**
 * Validate meeting times
 * @param nums the meeting times
 * @returns the meeting times
 */
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

export const isUserOnDesignReview = (user: User, designReview: DesignReview): boolean => {
  const requiredMembers = designReview.requiredMembers.map((user) => user.userId);
  const optionalMembers = designReview.optionalMembers.map((user) => user.userId);
  return requiredMembers.includes(user.userId) || optionalMembers.includes(user.userId);
};

export const meetingStartTimePipe = (times: number[]) => {
  const time = (times[0] % 12) + 10;

  return time <= 12 ? time + 'am' : time - 12 + 'pm';
};

export const transformStartTime = (times: number[]) => {
  return (times[0] % 12) + 10;
};

export const addHours = (date: Date, hours: number) => {
  const hoursToAdd = hours * 60 * 60 * 1000;
  date.setTime(date.getTime() + hoursToAdd);
  return date;
};
