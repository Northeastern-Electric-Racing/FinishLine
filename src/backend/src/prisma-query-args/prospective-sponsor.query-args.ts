import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';
import { getSponsorTaskQueryArgs } from './sponsor.query.args.js';

export type ProspectiveSponsorQueryArgs = ReturnType<typeof getProspectiveSponsorQueryArgs>;

export const getProspectiveSponsorQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Prospective_SponsorDefaultArgs>()({
    include: {
      contactor: getUserQueryArgs(organizationId),
      tasks: getSponsorTaskQueryArgs(organizationId),
      contact: true
    }
  });
