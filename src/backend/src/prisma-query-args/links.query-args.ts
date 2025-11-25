import { Prisma } from '@prisma/client';

export type LinkQueryArgs = ReturnType<typeof getLinkQueryArgs>;

export const getLinkQueryArgs = () =>
  Prisma.validator<Prisma.LinkDefaultArgs>()({
    include: { linkType: true }
  });
