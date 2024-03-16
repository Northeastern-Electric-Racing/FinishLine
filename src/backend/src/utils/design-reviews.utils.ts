import { HttpException } from './errors.utils';

/**
 * Validate meeting times
 * @param nums the meeting times
 * @returns the meeting times
 */
export function validateMeetingTimes(nums: number[]): number[] {
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] < 0 || nums[i] > 83) {
      throw new HttpException(400, 'meeting time must be between 0-83');
    }
    if (nums[i] !== nums[i - 1] + 1) {
      throw new HttpException(400, 'meeting times must be consecutive');
    }
  }
  return nums;
}
