import { Prisma } from '@prisma/client';

export type FaqQueryArgs = ReturnType<typeof getFaqQueryArgs>;

export const getFaqQueryArgs = () =>
  Prisma.validator<Prisma.FrequentlyAskedQuestionDefaultArgs>()({
    include: {
      userCreated: true,
      userDeleted: true
    }
  });
