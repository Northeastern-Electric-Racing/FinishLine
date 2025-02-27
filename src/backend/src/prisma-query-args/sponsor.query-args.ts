import { Prisma } from '@prisma/client';

export type SponsorQueryArgs = ReturnType<typeof getSponsorQueryArgs>;

export const getSponsorQueryArgs = () =>
  Prisma.validator<Prisma.SponsorDefaultArgs>()({
    include: {
      sponsorTasks: {
        include: {
          sponsor: true
        }
      }
    }
  });
