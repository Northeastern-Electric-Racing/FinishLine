import {
  First_Contact_Method,
  Prospective_Sponsor,
  Prospective_Sponsor_Status,
  Sponsor,
  Sponsor_Tier,
  Sponsor_Value_Type
} from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { TeamJoinRequestProcess } from './team-join-request.process.js';
import { FullUser } from '../context.js';
import { addDaysToDate } from 'shared';
import {
  ACTIVE_SPONSOR_CHANCE,
  chooseFirstContactMethod,
  chooseSponsorTierName,
  generateActiveYears,
  generateProspectiveStatus,
  generateProspectiveTaskNote,
  generateSponsorTaskNote,
  generateSponsorValue,
  generateTaskCount,
  generateValueTypes,
  notifyDateBefore,
  PROSPECTIVE_HAS_TASKS_CHANCE,
  PROSPECTIVE_SPONSOR_COUNT,
  prospectiveSponsorCreateInput,
  sponsorContactCreateInput,
  sponsorCreateInput,
  SPONSOR_COUNT,
  SPONSOR_HAS_TASKS_CHANCE,
  SPONSOR_TIER_FIXTURES,
  sponsorTaskCreateInput,
  sponsorTierCreateInput,
  TASK_ASSIGNEE_CHANCE,
  TASK_DONE_CHANCE,
  TASK_NOTIFY_CHANCE,
  TAX_EXEMPT_CHANCE
} from '../factories/sponsor.factory.js';

type SponsorInput = OrganizationOutput & UsersOutput;

export type SponsorOutput = {
  sponsorTiers: Sponsor_Tier[];
  sponsors: Sponsor[];
  prospectiveSponsors: Prospective_Sponsor[];
};

const SPONSOR_CONCURRENCY = 8;
type PlannedTask = {
  dueDate: Date;
  notifyDate: Date | undefined;
  notes: string;
  done: boolean;
  assigneeUserId: string | undefined;
};
type PlannedSponsor = {
  name: string;
  contact: { name: string; email?: string; phone?: string; position?: string };
  sponsorTierName: string;
  activeStatus: boolean;
  valueTypes: Sponsor_Value_Type[];
  sponsorValue: number;
  joinDate: Date;
  dateCreated: Date;
  activeYears: number[];
  taxExempt: boolean;
  sponsorNotes: string | undefined;
  tasks: PlannedTask[];
};
type PlannedConversion = {
  sponsorTierName: string;
  activeStatus: boolean;
  valueTypes: Sponsor_Value_Type[];
  sponsorValue: number;
  joinDate: Date;
  activeYears: number[];
  taxExempt: boolean;
  sponsorNotes: string | undefined;
  tasks: PlannedTask[];
};

type PlannedProspective = {
  organizationName: string;
  status: Prospective_Sponsor_Status;
  dateCreated: Date;
  lastContactDate: Date | undefined;
  firstContactMethod: First_Contact_Method | undefined;
  contactorUserId: string | undefined;
  contact: { name: string; email?: string; phone?: string; position?: string } | undefined;
  notes: string | undefined;
  tasks: PlannedTask[];
  dateDeleted: Date | undefined;
  conversion: PlannedConversion | undefined;
};

export class SponsorProcess extends SeedProcess<SponsorInput, SponsorOutput> {
  dependencies() {
    return [
      OrganizationProcess,
      UsersProcess,
      // Ensures guest -> member promotions from approved join requests have landed before this
      // process picks sponsor assignees from the `members` pool.
      TeamJoinRequestProcess
    ];
  }

  async run({ organization, members, leadership, heads, admins }: SponsorInput): Promise<SponsorOutput> {
    const { organizationId } = organization;
    const now = new Date();

    const assignableUsers: FullUser[] = [...members, ...leadership, ...heads, ...admins];
    if (assignableUsers.length === 0) throw new Error('SponsorProcess requires at least one user for task assignment.');

    const sponsorTiers = await Promise.all(
      SPONSOR_TIER_FIXTURES.map((tier) =>
        this.prisma.sponsor_Tier.create({
          data: sponsorTierCreateInput(organizationId, tier.name, tier.colorHexCode, tier.minSupportValue)
        })
      )
    );
    const tierIdByName = new Map(sponsorTiers.map((tier) => [tier.name, tier]));
    const minSupportByName = new Map(SPONSOR_TIER_FIXTURES.map((tier) => [tier.name, tier.minSupportValue]));

    const usedCompanyNames = new Set<string>();

    const plannedSponsors: PlannedSponsor[] = [];

    for (let i = 0; i < SPONSOR_COUNT; i++) {
      let name = this.faker.company.name();
      while (usedCompanyNames.has(name)) name = `${this.faker.company.name()} ${this.faker.string.alpha(2)}`;
      usedCompanyNames.add(name);

      const contactName = this.faker.person.fullName();
      const contact = {
        name: contactName,
        email: this.faker.internet.email({ firstName: contactName.split(' ')[0] }).toLowerCase(),
        phone: this.faker.datatype.boolean({ probability: 0.5 }) ? this.faker.phone.number() : undefined,
        position: this.faker.datatype.boolean({ probability: 0.5 }) ? this.faker.person.jobTitle() : undefined
      };

      const sponsorTierName = chooseSponsorTierName(this.faker);
      const tierMin = minSupportByName.get(sponsorTierName) ?? 0;
      const sponsorValue = generateSponsorValue(this.faker, tierMin);
      const valueTypes = generateValueTypes(this.faker);

      const joinDate = this.faker.date.between({ from: addDaysToDate(now, -540), to: now });
      const dateCreated = this.faker.date.between({ from: joinDate, to: now });
      const activeYears = generateActiveYears(this.faker, joinDate, now);

      const activeStatus = this.faker.datatype.boolean({ probability: ACTIVE_SPONSOR_CHANCE });
      const taxExempt = this.faker.datatype.boolean({ probability: TAX_EXEMPT_CHANCE });
      const sponsorNotes = this.faker.datatype.boolean({ probability: 0.4 }) ? this.faker.lorem.sentence() : undefined;

      const tasks = this.planTasks(
        this.faker.datatype.boolean({ probability: SPONSOR_HAS_TASKS_CHANCE }),
        dateCreated,
        now,
        assignableUsers,
        () => generateSponsorTaskNote(this.faker)
      );

      plannedSponsors.push({
        name,
        contact,
        sponsorTierName,
        activeStatus,
        valueTypes,
        sponsorValue,
        joinDate,
        dateCreated,
        activeYears,
        taxExempt,
        sponsorNotes,
        tasks
      });
    }

    const plannedProspectives: PlannedProspective[] = [];

    for (let i = 0; i < PROSPECTIVE_SPONSOR_COUNT; i++) {
      let organizationName = this.faker.company.name();
      while (usedCompanyNames.has(organizationName))
        organizationName = `${this.faker.company.name()} ${this.faker.string.alpha(2)}`;
      usedCompanyNames.add(organizationName);

      const status = generateProspectiveStatus(this.faker);
      const dateCreated = this.faker.date.between({ from: addDaysToDate(now, -365), to: now });

      // NOT_IN_CONTACT prospects have no contact method / contactor / last-contact yet.
      const isContacted = status !== Prospective_Sponsor_Status.NOT_IN_CONTACT;

      const lastContactDate = isContacted ? this.faker.date.between({ from: dateCreated, to: now }) : undefined;
      const firstContactMethod = isContacted ? chooseFirstContactMethod(this.faker) : undefined;
      const contactorUserId = isContacted ? this.faker.helpers.arrayElement(assignableUsers).userId : undefined;

      const contact = isContacted
        ? (() => {
            const cName = this.faker.person.fullName();
            return {
              name: cName,
              email: this.faker.internet.email({ firstName: cName.split(' ')[0] }).toLowerCase(),
              phone: this.faker.datatype.boolean({ probability: 0.3 }) ? this.faker.phone.number() : undefined,
              position: this.faker.datatype.boolean({ probability: 0.3 }) ? this.faker.person.jobTitle() : undefined
            };
          })()
        : undefined;

      const notes = this.faker.datatype.boolean({ probability: 0.4 }) ? this.faker.lorem.sentence() : undefined;

      const tasks = this.planTasks(
        this.faker.datatype.boolean({ probability: PROSPECTIVE_HAS_TASKS_CHANCE }),
        dateCreated,
        now,
        assignableUsers,
        () => generateProspectiveTaskNote(this.faker)
      );

      // An ACCEPTED prospective converts into a real Sponsor: the prospective is soft-deleted
      // (dateDeleted = acceptance date) and a Sponsor is created with a new contact.
      let dateDeleted: Date | undefined;
      let conversion: PlannedConversion | undefined;
      if (status === Prospective_Sponsor_Status.ACCEPTED) {
        // Given that there is contact, we will put that as our from date
        const acceptedFrom = lastContactDate ?? dateCreated;
        dateDeleted = this.faker.date.between({ from: acceptedFrom, to: now });

        const sponsorTierName = chooseSponsorTierName(this.faker);
        const tierMin = minSupportByName.get(sponsorTierName) ?? 0;
        conversion = {
          sponsorTierName,
          activeStatus: this.faker.datatype.boolean({ probability: ACTIVE_SPONSOR_CHANCE }),
          valueTypes: generateValueTypes(this.faker),
          sponsorValue: generateSponsorValue(this.faker, tierMin),
          joinDate: dateDeleted,
          activeYears: generateActiveYears(this.faker, dateDeleted, now),
          taxExempt: this.faker.datatype.boolean({ probability: TAX_EXEMPT_CHANCE }),
          sponsorNotes: this.faker.datatype.boolean({ probability: 0.4 }) ? this.faker.lorem.sentence() : undefined,
          tasks: this.planTasks(
            this.faker.datatype.boolean({ probability: SPONSOR_HAS_TASKS_CHANCE }),
            dateDeleted,
            now,
            assignableUsers,
            () => generateSponsorTaskNote(this.faker)
          )
        };
      }

      plannedProspectives.push({
        organizationName,
        status,
        dateCreated,
        lastContactDate,
        firstContactMethod,
        contactorUserId,
        contact,
        notes,
        tasks,
        dateDeleted,
        conversion
      });
    }

    const sponsors: Sponsor[] = [];
    for (let i = 0; i < plannedSponsors.length; i += SPONSOR_CONCURRENCY) {
      const batch = plannedSponsors.slice(i, i + SPONSOR_CONCURRENCY);
      const created = await Promise.all(batch.map((planned) => this.writeSponsor(planned, organizationId, tierIdByName)));
      sponsors.push(...created);
    }

    const prospectiveSponsors: Prospective_Sponsor[] = [];
    for (let i = 0; i < plannedProspectives.length; i += SPONSOR_CONCURRENCY) {
      const batch = plannedProspectives.slice(i, i + SPONSOR_CONCURRENCY);
      const results = await Promise.all(
        batch.map((planned) => this.writeProspective(planned, organizationId, tierIdByName))
      );
      for (const { prospective, convertedSponsor } of results) {
        prospectiveSponsors.push(prospective);
        if (convertedSponsor) sponsors.push(convertedSponsor);
      }
    }

    return { sponsorTiers, sponsors, prospectiveSponsors };
  }

  private planTasks(
    hasTasks: boolean,
    createdAfter: Date,
    now: Date,
    assignableUsers: FullUser[],
    noteFor: () => string
  ): PlannedTask[] {
    if (!hasTasks) return [];

    const count = generateTaskCount(this.faker);
    const tasks: PlannedTask[] = [];
    for (let i = 0; i < count; i++) {
      const dueDate = this.faker.date.between({
        from: createdAfter,
        to: addDaysToDate(now, 30)
      });
      const notifyDate = this.faker.datatype.boolean({ probability: TASK_NOTIFY_CHANCE })
        ? notifyDateBefore(this.faker, dueDate)
        : undefined;
      const done = this.faker.datatype.boolean({ probability: TASK_DONE_CHANCE });
      const assigneeUserId = this.faker.datatype.boolean({ probability: TASK_ASSIGNEE_CHANCE })
        ? this.faker.helpers.arrayElement(assignableUsers).userId
        : undefined;

      tasks.push({ dueDate, notifyDate, notes: noteFor(), done, assigneeUserId });
    }
    return tasks;
  }

  private async writeSponsor(
    planned: PlannedSponsor,
    organizationId: string,
    tierIdByName: Map<string, Sponsor_Tier>
  ): Promise<Sponsor> {
    const tier = tierIdByName.get(planned.sponsorTierName);
    if (!tier) throw new Error(`Missing seeded tier ${planned.sponsorTierName}`);

    const contact = await this.prisma.sponsor_Contact.create({
      data: sponsorContactCreateInput(
        planned.contact.name,
        planned.contact.email,
        planned.contact.phone,
        planned.contact.position
      )
    });

    const sponsor = await this.prisma.sponsor.create({
      data: sponsorCreateInput(
        organizationId,
        planned.name,
        contact.sponsorContactId,
        tier.sponsorTierId,
        planned.activeStatus,
        planned.valueTypes,
        planned.sponsorValue,
        planned.joinDate,
        planned.dateCreated,
        planned.activeYears,
        planned.taxExempt,
        planned.sponsorNotes
      )
    });

    await Promise.all(
      planned.tasks.map((task) =>
        this.prisma.sponsor_Task.create({
          data: sponsorTaskCreateInput(
            { sponsorId: sponsor.sponsorId },
            task.dueDate,
            task.notifyDate,
            task.notes,
            task.done,
            task.assigneeUserId
          )
        })
      )
    );

    return sponsor;
  }

  private async writeProspective(
    planned: PlannedProspective,
    organizationId: string,
    tierIdByName: Map<string, Sponsor_Tier>
  ): Promise<{ prospective: Prospective_Sponsor; convertedSponsor?: Sponsor }> {
    let contactId: string | undefined;
    if (planned.contact) {
      const contact = await this.prisma.sponsor_Contact.create({
        data: sponsorContactCreateInput(
          planned.contact.name,
          planned.contact.email,
          planned.contact.phone,
          planned.contact.position
        )
      });
      contactId = contact.sponsorContactId;
    }

    const prospective = await this.prisma.prospective_Sponsor.create({
      data: prospectiveSponsorCreateInput(
        organizationId,
        planned.organizationName,
        planned.status,
        planned.dateCreated,
        planned.lastContactDate,
        planned.firstContactMethod,
        planned.contactorUserId,
        contactId,
        planned.notes,
        planned.dateDeleted
      )
    });

    await Promise.all(
      planned.tasks.map((task) =>
        this.prisma.sponsor_Task.create({
          data: sponsorTaskCreateInput(
            { prospectiveSponsorId: prospective.prospectiveSponsorId },
            task.dueDate,
            task.notifyDate,
            task.notes,
            task.done,
            task.assigneeUserId
          )
        })
      )
    );

    let convertedSponsor: Sponsor | undefined;
    if (planned.conversion) {
      if (!planned.contact) throw new Error(`Converted prospective ${planned.organizationName} has no contact to copy.`);

      const conv = planned.conversion;
      const tier = tierIdByName.get(conv.sponsorTierName);
      if (!tier) throw new Error(`Missing seeded tier ${conv.sponsorTierName}`);

      const sponsorContact = await this.prisma.sponsor_Contact.create({
        data: sponsorContactCreateInput(
          planned.contact.name,
          planned.contact.email,
          planned.contact.phone,
          planned.contact.position
        )
      });

      convertedSponsor = await this.prisma.sponsor.create({
        data: sponsorCreateInput(
          organizationId,
          planned.organizationName,
          sponsorContact.sponsorContactId,
          tier.sponsorTierId,
          conv.activeStatus,
          conv.valueTypes,
          conv.sponsorValue,
          conv.joinDate,
          conv.joinDate,
          conv.activeYears,
          conv.taxExempt,
          conv.sponsorNotes
        )
      });

      await Promise.all(
        conv.tasks.map((task) =>
          this.prisma.sponsor_Task.create({
            data: sponsorTaskCreateInput(
              { sponsorId: convertedSponsor!.sponsorId },
              task.dueDate,
              task.notifyDate,
              task.notes,
              task.done,
              task.assigneeUserId
            )
          })
        )
      );
    }

    return { prospective, convertedSponsor };
  }
}
