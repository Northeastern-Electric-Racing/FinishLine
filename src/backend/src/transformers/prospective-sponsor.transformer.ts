import { Prisma } from '@prisma/client';
import { ProspectiveSponsor, ProspectiveSponsorStatus, FirstContactMethod } from 'shared';
import { ProspectiveSponsorQueryArgs } from '../prisma-query-args/prospective-sponsor.query-args.js';
import { userTransformer } from './user.transformer.js';
import { sponsorTaskTransformer } from './sponsor-task.transformer.js';

export const prospectiveSponsorTransformer = (
  prospectiveSponsor: Prisma.Prospective_SponsorGetPayload<ProspectiveSponsorQueryArgs>
): ProspectiveSponsor => {
  return {
    prospectiveSponsorId: prospectiveSponsor.prospectiveSponsorId,
    organizationName: prospectiveSponsor.organizationName,
    dateCreated: prospectiveSponsor.dateCreated,
    lastContactDate: prospectiveSponsor.lastContactDate,
    highlightThresholdDays: prospectiveSponsor.highlightThresholdDays,
    status: prospectiveSponsor.status as ProspectiveSponsorStatus,
    firstContactMethod: prospectiveSponsor.firstContactMethod as FirstContactMethod,
    contactor: userTransformer(prospectiveSponsor.contactor),
    contact: {
      name: prospectiveSponsor.contact.name,
      email: prospectiveSponsor.contact.email ?? undefined,
      phone: prospectiveSponsor.contact.phone ?? undefined,
      position: prospectiveSponsor.contact.position ?? undefined
    },
    notes: prospectiveSponsor.notes ?? undefined,
    tasks: prospectiveSponsor.tasks.map(sponsorTaskTransformer)
  };
};

export default prospectiveSponsorTransformer;
