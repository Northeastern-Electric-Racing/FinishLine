import { Prisma, Guest_Definition_Type as PrismaGuestDefinitionType } from '@prisma/client';
import { FrequentlyAskedQuestion, GuestDefinition, GuestDefinitionType } from 'shared';
import { FaqQueryArgs } from '../prisma-query-args/faq.query-args.js';
import { userTransformer } from './user.transformer.js';

export const faqTransformer = (faq: Prisma.FrequentlyAskedQuestionGetPayload<FaqQueryArgs>): FrequentlyAskedQuestion => ({
  faqId: faq.faqId,
  question: faq.question,
  answer: faq.answer,
  userCreated: userTransformer(faq.userCreated),
  dateCreated: faq.dateCreated,
  dateDeleted: faq.dateDeleted ?? undefined
});

export const definitionTypeTransformer = (type: PrismaGuestDefinitionType): GuestDefinitionType => {
  const mapping: Record<PrismaGuestDefinitionType, GuestDefinitionType> = {
    PROJECT_MANAGEMENT: GuestDefinitionType.PROJECT_MANAGEMENT,
    INFO_PAGE: GuestDefinitionType.INFO_PAGE
  };
  return mapping[type];
};

export const guestDefinitionTransformer = (guestDefinition: Prisma.Guest_DefinitionGetPayload<{}>): GuestDefinition => ({
  definitionId: guestDefinition.definitionId,
  term: guestDefinition.term,
  description: guestDefinition.description,
  order: guestDefinition.order,
  buttonText: guestDefinition.buttonText ?? undefined,
  buttonLink: guestDefinition.buttonLink ?? undefined,
  icon: guestDefinition.icon ?? undefined,
  type: definitionTypeTransformer(guestDefinition.type) ?? GuestDefinitionType.INFO_PAGE
});
