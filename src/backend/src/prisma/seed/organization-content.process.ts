import {
  Announcement,
  Checklist,
  Checklist_Item_Type,
  Contact,
  FrequentlyAskedQuestion,
  Guest_Definition_Type,
  Milestone,
  PopUp,
  Guest_Definition
} from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ConfigDataOutput, ConfigDataProcess } from './config-data.process.js';
import { FullUser } from '../context.js';
import { addDaysToDate } from 'shared';
import {
  ANNOUNCEMENT_COUNT,
  announcementCreateInput,
  CHECKLIST_ROOT_COUNT,
  CHECKLIST_TEAM_SPECIFIC_CHANCE,
  checklistCreateInput,
  chooseChecklistTeamType,
  chooseSlackChannel,
  choosePopUp,
  CONTACT_TITLE_FIXTURES,
  contactCreateInput,
  DELETED_CONTENT_CHANCE,
  FAQ_COUNT,
  FAQ_POOL,
  faqCreateInput,
  generateAnnouncementText,
  generateChecklistRootContent,
  generateChecklistSubtaskContent,
  generateRecentDate,
  generateSenderName,
  generateSubtaskCount,
  GUEST_DEFINITION_COUNT,
  GUEST_DEFINITION_TERMS,
  guestDefinitionCreateInput,
  MILESTONE_FIXTURES,
  milestoneCreateInput,
  POPUP_COUNT,
  popUpCreateInput
} from '../factories/organization-content.factory.js';
import { clampDate } from '../dates.js';

type OrganizationContentInput = OrganizationOutput & UsersOutput & ConfigDataOutput;

export type OrganizationContentOutput = {
  faqs: FrequentlyAskedQuestion[];
  milestones: Milestone[];
  contacts: Contact[];
  announcements: Announcement[];
  popUps: PopUp[];
  guestDefinitions: Guest_Definition[];
  checklists: Checklist[];
};

const CONTENT_CONCURRENCY = 8;

type PlannedChecklistRoot = {
  content: string;
  itemType: Checklist_Item_Type;
  isOptional: boolean;
  displayIndex: number;
  dateCreated: Date;
  teamTypeId: string | undefined;
  children: {
    content: string;
    itemType: Checklist_Item_Type;
    isOptional: boolean;
    displayIndex: number;
    dateCreated: Date;
  }[];
};

export class OrganizationContentProcess extends SeedProcess<OrganizationContentInput, OrganizationContentOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ConfigDataProcess];
  }

  async run({
    organization,
    leadership,
    heads,
    admins,
    teamTypes
  }: OrganizationContentInput): Promise<OrganizationContentOutput> {
    const { organizationId } = organization;
    const now = new Date();

    const leadershipPool: FullUser[] = [...admins, ...heads, ...leadership];
    if (leadershipPool.length === 0)
      throw new Error('OrganizationContentProcess requires at least one leadership-level user.');
    const [primaryActor] = leadershipPool;

    const plannedFaqs = this.faker.helpers.shuffle([...FAQ_POOL]).slice(0, FAQ_COUNT);
    const faqs = await Promise.all(
      plannedFaqs.map((faq) =>
        this.prisma.frequentlyAskedQuestion.create({
          data: faqCreateInput(organizationId, faq.question, faq.answer, primaryActor.userId, now)
        })
      )
    );

    // Milestone fixtures (dates relative to now)
    const milestones = await Promise.all(
      MILESTONE_FIXTURES.map((m) =>
        this.prisma.milestone.create({
          data: milestoneCreateInput(
            organizationId,
            m.name,
            m.description,
            addDaysToDate(now, m.dayOffset),
            primaryActor.userId,
            now
          )
        })
      )
    );

    const contacts = await Promise.all(
      CONTACT_TITLE_FIXTURES.map((title, i) => {
        const user = leadershipPool[i % leadershipPool.length];
        return this.prisma.contact.create({
          data: contactCreateInput(organizationId, title, user.userId)
        });
      })
    );

    const dateMessageSent = generateRecentDate(this.faker, now);

    const plannedAnnouncements = Array.from({ length: ANNOUNCEMENT_COUNT }, (_, i) => ({
      text: generateAnnouncementText(this.faker),
      senderName: generateSenderName(this.faker),
      slackChannelName: chooseSlackChannel(this.faker),
      slackEventId: `seed-slack-event-${i}`,
      dateMessageSent,
      dateDeleted: this.faker.datatype.boolean({ probability: DELETED_CONTENT_CHANCE })
        ? this.faker.date.between({ from: dateMessageSent, to: now })
        : undefined
    }));

    const plannedPopUps = Array.from({ length: POPUP_COUNT }, () => {
      const popUp = choosePopUp(this.faker);
      const hasLink = this.faker.datatype.boolean({ probability: 0.5 });
      return {
        text: popUp.text,
        iconName: popUp.iconName,
        eventLink: hasLink ? `/events/${this.faker.string.uuid()}` : undefined
      };
    });

    const plannedGuestDefinitions = this.planGuestDefinitions(now);

    const plannedChecklistRoots: PlannedChecklistRoot[] = Array.from({ length: CHECKLIST_ROOT_COUNT }, (_, rootIndex) => {
      const childCount = generateSubtaskCount(this.faker);
      const rootDate = generateRecentDate(this.faker, now);
      const teamTypeId = this.faker.datatype.boolean({ probability: CHECKLIST_TEAM_SPECIFIC_CHANCE })
        ? chooseChecklistTeamType(this.faker, teamTypes)?.teamTypeId
        : undefined;
      return {
        content: generateChecklistRootContent(this.faker),
        itemType: Checklist_Item_Type.TASK,
        isOptional: this.faker.datatype.boolean({ probability: 0.2 }),
        displayIndex: rootIndex + 1,
        dateCreated: rootDate,
        teamTypeId,
        children: Array.from({ length: childCount }, (_, childIndex) => ({
          content: generateChecklistSubtaskContent(this.faker),
          itemType: Checklist_Item_Type.TASK,
          isOptional: this.faker.datatype.boolean({ probability: 0.3 }),
          displayIndex: childIndex + 1,
          dateCreated: rootDate
        }))
      };
    });

    const announcements: Announcement[] = [];
    for (let i = 0; i < plannedAnnouncements.length; i += CONTENT_CONCURRENCY) {
      const batch = plannedAnnouncements.slice(i, i + CONTENT_CONCURRENCY);
      const created = await Promise.all(
        batch.map((a) =>
          this.prisma.announcement.create({
            data: announcementCreateInput(
              organizationId,
              a.text,
              a.senderName,
              a.slackEventId,
              a.slackChannelName,
              a.dateMessageSent,
              a.dateDeleted
            )
          })
        )
      );
      announcements.push(...created);
    }

    const popUps = await Promise.all(
      plannedPopUps.map((p) =>
        this.prisma.popUp.create({ data: popUpCreateInput(organizationId, p.text, p.iconName, p.eventLink) })
      )
    );

    const guestDefinitions = await Promise.all(
      plannedGuestDefinitions.map((g) =>
        this.prisma.guest_Definition.create({
          data: guestDefinitionCreateInput(
            organizationId,
            g.term,
            g.description,
            g.order,
            g.type,
            primaryActor.userId,
            g.dateCreated
          )
        })
      )
    );

    const checklists: Checklist[] = [];
    const createdRoots = await Promise.all(
      plannedChecklistRoots.map((root) =>
        this.prisma.checklist.create({
          data: checklistCreateInput(
            organizationId,
            root.content,
            root.itemType,
            root.isOptional,
            root.displayIndex,
            primaryActor.userId,
            root.dateCreated,
            undefined,
            root.teamTypeId
          )
        })
      )
    );
    checklists.push(...createdRoots);

    for (let rootIndex = 0; rootIndex < plannedChecklistRoots.length; rootIndex++) {
      const root = plannedChecklistRoots[rootIndex];
      const parentId = createdRoots[rootIndex].checklistId;
      if (root.children.length === 0) continue;

      const createdChildren = await Promise.all(
        root.children.map((child) =>
          this.prisma.checklist.create({
            data: checklistCreateInput(
              organizationId,
              child.content,
              child.itemType,
              child.isOptional,
              child.displayIndex,
              primaryActor.userId,
              child.dateCreated,
              parentId,
              root.teamTypeId
            )
          })
        )
      );
      checklists.push(...createdChildren);
    }

    return { faqs, milestones, contacts, announcements, popUps, guestDefinitions, checklists };
  }

  private planGuestDefinitions(now: Date): {
    term: string;
    description: string;
    order: number;
    type: Guest_Definition_Type;
    dateCreated: Date;
  }[] {
    const shuffled = this.faker.helpers.shuffle([...GUEST_DEFINITION_TERMS]).slice(0, GUEST_DEFINITION_COUNT);
    return shuffled.map((entry, index) => ({
      term: entry.term,
      description: entry.description,
      order: index,
      type: Guest_Definition_Type.INFO_PAGE,
      dateCreated: generateRecentDate(this.faker, now)
    }));
  }
}
