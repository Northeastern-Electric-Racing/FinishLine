import { HttpException } from './errors.utils';

export function validateMeetingTimes(nums: number[]): number[] {
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[i - 1] + 1 || !(nums[i] >= 0) || !(nums[i] <= 48)) {
      throw new HttpException(400, 'meeting time must be consecutive and between 0-48');
    }
  }
  return nums;
}
