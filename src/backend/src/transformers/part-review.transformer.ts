import { FrequentlyAskedQuestion } from '@prisma/client';
import { FrequentlyAskedQuestion as faqShared } from 'shared';

export const partReviewFaqTransformer = (faq: FrequentlyAskedQuestion): faqShared => {
  return faq;
};
