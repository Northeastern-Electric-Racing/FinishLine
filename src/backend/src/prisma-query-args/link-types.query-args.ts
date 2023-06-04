import { Prisma } from '@prisma/client';

const linkTypeQueryArgs = Prisma.validator<Prisma.LinkTypeArgs>()({
  include: { creator: true }
});

export default linkTypeQueryArgs;
