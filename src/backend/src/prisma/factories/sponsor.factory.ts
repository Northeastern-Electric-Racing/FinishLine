import { Faker } from '@faker-js/faker';
import { First_Contact_Method, Prisma, Prospective_Sponsor_Status, Sponsor_Value_Type } from '@prisma/client';
import { addDaysToDate } from 'shared';

export const SPONSOR_COUNT = 25;
export const PROSPECTIVE_SPONSOR_COUNT = 25;

export const ACTIVE_SPONSOR_CHANCE = 0.85;
export const TAX_EXEMPT_CHANCE = 0.4;
export const SPONSOR_HAS_TASKS_CHANCE = 0.5;
export const PROSPECTIVE_HAS_TASKS_CHANCE = 0.35;
export const TASK_DONE_CHANCE = 0.4;
export const TASK_ASSIGNEE_CHANCE = 0.7;
export const TASK_NOTIFY_CHANCE = 0.5;

export const ACTIVE_YEAR_DETERIORATION = 0.5;

export const SPONSOR_TIER_FIXTURES: { name: string; colorHexCode: string; minSupportValue: number }[] = [
  { name: 'Unassigned', colorHexCode: '#950', minSupportValue: 0 },
  { name: 'Discount', colorHexCode: '#013220', minSupportValue: 0 },
  { name: 'Grant', colorHexCode: '#8A00C4', minSupportValue: 0 },
  { name: 'Black Flag', colorHexCode: '#020202', minSupportValue: 1000 },
  { name: 'Bronze Pulse', colorHexCode: '#d7b657', minSupportValue: 2500 },
  { name: 'Silver Circuit', colorHexCode: '#a6a6a6', minSupportValue: 5000 },
  { name: 'Red Line', colorHexCode: '#ff0404', minSupportValue: 500 },
  { name: 'Elite Diamond', colorHexCode: '#313493', minSupportValue: 10000 }
];

const CONTRIBUTING_TIER_WEIGHTS: { tierName: string; weight: number }[] = [
  { tierName: 'Black Flag', weight: 35 },
  { tierName: 'Red Line', weight: 20 },
  { tierName: 'Bronze Pulse', weight: 20 },
  { tierName: 'Silver Circuit', weight: 15 },
  { tierName: 'Elite Diamond', weight: 10 }
];

const SPECIAL_TIER_NAMES = ['Discount', 'Grant', 'Unassigned'] as const;

const VALUE_TYPE_COMBINATIONS: { weight: number; value: Sponsor_Value_Type[] }[] = [
  { weight: 57, value: [Sponsor_Value_Type.MONETARY] },
  { weight: 22, value: [Sponsor_Value_Type.STOCK] },
  { weight: 11, value: [Sponsor_Value_Type.DISCOUNT] },
  { weight: 7, value: [Sponsor_Value_Type.MONETARY, Sponsor_Value_Type.STOCK] },
  { weight: 3, value: [Sponsor_Value_Type.MONETARY, Sponsor_Value_Type.DISCOUNT] }
];

const PROSPECTIVE_STATUS_WEIGHTS: { weight: number; value: Prospective_Sponsor_Status }[] = [
  { weight: 35, value: Prospective_Sponsor_Status.NOT_IN_CONTACT },
  { weight: 35, value: Prospective_Sponsor_Status.IN_PROGRESS },
  { weight: 22, value: Prospective_Sponsor_Status.DECLINED },
  { weight: 8, value: Prospective_Sponsor_Status.ACCEPTED }
];

const FIRST_CONTACT_METHODS: First_Contact_Method[] = [
  First_Contact_Method.OUTBOUND_EMAIL,
  First_Contact_Method.INBOUND_EMAIL,
  First_Contact_Method.INBOUND_FORM
];

const SPONSOR_TASK_NOTE_TEMPLATES = [
  'Add their logo to the website',
  'Send newsletter + resumes',
  'Social media shoutout',
  'Follow up on benefits fulfillment',
  'Schedule facility tour',
  'Confirm annual sponsorship status',
  'Send thank-you and photos'
];

const PROSPECTIVE_TASK_NOTE_TEMPLATES = [
  'Follow up on initial outreach',
  'Send sponsorship packet',
  'Set up intro meeting',
  'Check back after no response',
  'Draft custom proposal'
];

export const chooseSponsorTierName = (faker: Faker): string => {
  if (faker.datatype.boolean({ probability: 0.12 })) {
    return faker.helpers.arrayElement(SPECIAL_TIER_NAMES);
  }
  return faker.helpers.weightedArrayElement(
    CONTRIBUTING_TIER_WEIGHTS.map(({ tierName, weight }) => ({ weight, value: tierName }))
  );
};

export const generateSponsorValue = (faker: Faker, tierMinSupportValue: number): number => {
  if (tierMinSupportValue === 0) return faker.number.int({ min: 0, max: 500 });
  return faker.number.int({ min: tierMinSupportValue, max: tierMinSupportValue * 2 });
};

export const generateValueTypes = (faker: Faker): Sponsor_Value_Type[] =>
  faker.helpers.weightedArrayElement(VALUE_TYPE_COMBINATIONS);

export const generateActiveYears = (faker: Faker, joinDate: Date, now: Date): number[] => {
  const joinYear = joinDate.getFullYear();
  const currentYear = now.getFullYear();
  let activeYear = joinYear;
  const years = [joinYear];
  while (
    faker.datatype.boolean({
      probability: 0.5 * (activeYear - joinYear === 0 ? 1 : ACTIVE_YEAR_DETERIORATION ** (activeYear - joinYear))
    }) &&
    activeYear + 1 <= currentYear
  ) {
    years.push(++activeYear);
  }
  return years;
};

export const generateProspectiveStatus = (faker: Faker): Prospective_Sponsor_Status =>
  faker.helpers.weightedArrayElement(PROSPECTIVE_STATUS_WEIGHTS);

export const chooseFirstContactMethod = (faker: Faker): First_Contact_Method =>
  faker.helpers.arrayElement(FIRST_CONTACT_METHODS);

export const generateSponsorTaskNote = (faker: Faker): string => faker.helpers.arrayElement(SPONSOR_TASK_NOTE_TEMPLATES);

export const generateProspectiveTaskNote = (faker: Faker): string =>
  faker.helpers.arrayElement(PROSPECTIVE_TASK_NOTE_TEMPLATES);

export const generateTaskCount = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 60, value: 1 },
    { weight: 30, value: 2 },
    { weight: 10, value: 3 }
  ]);

export const sponsorTierCreateInput = (
  organizationId: string,
  name: string,
  colorHexCode: string,
  minSupportValue: number
): Prisma.Sponsor_TierCreateInput => ({
  name,
  colorHexCode,
  minSupportValue,
  organization: { connect: { organizationId } }
});

export const sponsorContactCreateInput = (
  name: string,
  email: string | undefined,
  phone: string | undefined,
  position: string | undefined
): Prisma.Sponsor_ContactCreateInput => ({
  name,
  email: email ?? null,
  phone: phone ?? null,
  position: position ?? null
});

export const sponsorCreateInput = (
  organizationId: string,
  name: string,
  contactId: string,
  sponsorTierId: string,
  activeStatus: boolean,
  valueTypes: Sponsor_Value_Type[],
  sponsorValue: number,
  joinDate: Date,
  dateCreated: Date,
  activeYears: number[],
  taxExempt: boolean,
  sponsorNotes: string | undefined
): Prisma.SponsorCreateInput => ({
  name,
  activeStatus,
  valueTypes,
  sponsorValue,
  joinDate,
  dateCreated,
  activeYears,
  taxExempt,
  sponsorNotes: sponsorNotes ?? null,
  organization: { connect: { organizationId } },
  contact: { connect: { sponsorContactId: contactId } },
  tier: { connect: { sponsorTierId } }
});

export const prospectiveSponsorCreateInput = (
  organizationId: string,
  organizationName: string,
  status: Prospective_Sponsor_Status,
  dateCreated: Date,
  lastContactDate: Date | undefined,
  firstContactMethod: First_Contact_Method | undefined,
  contactorUserId: string | undefined,
  contactId: string | undefined,
  notes: string | undefined,
  dateDeleted: Date | undefined
): Prisma.Prospective_SponsorCreateInput => ({
  organizationName,
  status,
  dateCreated,
  lastContactDate: lastContactDate ?? null,
  firstContactMethod: firstContactMethod ?? null,
  notes: notes ?? null,
  dateDeleted: dateDeleted ?? null,
  organization: { connect: { organizationId } },
  ...(contactorUserId ? { contactor: { connect: { userId: contactorUserId } } } : {}),
  ...(contactId ? { contact: { connect: { sponsorContactId: contactId } } } : {})
});

export type SponsorTaskParent = { sponsorId: string } | { prospectiveSponsorId: string };

export const sponsorTaskCreateInput = (
  parent: SponsorTaskParent,
  dueDate: Date,
  notifyDate: Date | undefined,
  notes: string,
  done: boolean,
  assigneeUserId: string | undefined
): Prisma.Sponsor_TaskCreateInput => ({
  dueDate,
  notifyDate: notifyDate ?? null,
  notes,
  done,
  ...(assigneeUserId ? { assignee: { connect: { userId: assigneeUserId } } } : {}),
  ...('sponsorId' in parent
    ? { sponsor: { connect: { sponsorId: parent.sponsorId } } }
    : { prospectiveSponsor: { connect: { prospectiveSponsorId: parent.prospectiveSponsorId } } })
});

export const notifyDateBefore = (faker: Faker, dueDate: Date): Date =>
  addDaysToDate(dueDate, -faker.number.int({ min: 1, max: 7 }));
