import { PartReviewCommonMistake } from '@prisma/client';
import { PartReviewCommonMistake as SharedCommonMistake } from 'shared';

export const partsReviewCommonMistakeTransformer = (commonMistake: PartReviewCommonMistake): SharedCommonMistake => {
  return commonMistake;
};
