import { Prisma } from '@prisma/client';
import { FrequentlyAskedQuestion } from 'shared';
import { FaqQueryArgs } from '../prisma-query-args/faq.query.args';
import { userTransformer } from './user.transformer';

export const faqTransformer = (faq: Prisma.FrequentlyAskedQuestionGetPayload<FaqQueryArgs>): FrequentlyAskedQuestion => ({
  faqId: faq.faqId,
  question: faq.question,
  answer: faq.answer,
  userCreated: userTransformer(faq.userCreated),
  userDeleted: faq.userDeleted ? userTransformer(faq.userDeleted) : undefined,
  dateCreated: faq.dateCreated,
  dateDeleted: faq.dateDeleted ?? undefined
});