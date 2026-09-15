import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';

export type FaqQueryArgs = ReturnType<typeof getFaqQueryArgs>;

export const getFaqQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.FrequentlyAskedQuestionDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId)
    }
  });
