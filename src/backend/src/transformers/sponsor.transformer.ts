import { Prisma } from '@prisma/client';
import { Sponsor } from 'shared';
import { SponsorQueryArgs } from '../prisma-query-args/sponsor.query.args';
import sponsorTaskTransformer from './sponsor-task.transformer';

const sponsorTransformer = (sponsor: Prisma.SponsorGetPayload<SponsorQueryArgs>): Sponsor => {
  return {
    ...sponsor,
    sponsorTasks: sponsor.sponsorTasks.map(sponsorTaskTransformer)
  };
};

export default sponsorTransformer;
