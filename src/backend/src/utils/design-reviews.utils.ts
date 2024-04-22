import { DesignReview, User } from 'shared';
import { HttpException } from './errors.utils';

/**
 * Validate meeting times
 * @param nums the meeting times
 * @returns the meeting times
 */
export const validateMeetingTimes = (nums: number[]): number[] => {
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] < 0 || nums[i] > 83) {
      throw new HttpException(400, 'Meeting times have to be in range 0-83');
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
