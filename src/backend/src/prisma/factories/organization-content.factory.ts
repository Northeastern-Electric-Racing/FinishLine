import { Faker } from '@faker-js/faker';
import { Checklist_Item_Type, Guest_Definition_Type, Prisma } from '@prisma/client';
import { addDaysToDate } from 'shared';
import { seedConfig } from '../seed-config.js';

export const ANNOUNCEMENT_COUNT = seedConfig.organizationContent.announcementContent;
export const POPUP_COUNT = seedConfig.organizationContent.popupContent;
export const GUEST_DEFINITION_COUNT = seedConfig.organizationContent.guestDefinitionCount;
export const CHECKLIST_ROOT_COUNT = seedConfig.organizationContent.checklistRootCount;
export const FAQ_COUNT = seedConfig.organizationContent.faqCount;

export const DELETED_CONTENT_CHANCE = 0.1;

// Chance a checklist root is team-specific (its whole subtree carries a team type) vs. general
// (null teamTypeId). Tuned so the overall null/assigned split lands near half-and-half.
export const CHECKLIST_TEAM_SPECIFIC_CHANCE = 0.5;

export const chooseChecklistTeamType = <T>(faker: Faker, teamTypes: T[]): T | undefined =>
  teamTypes.length === 0 ? undefined : faker.helpers.arrayElement(teamTypes);

export const FAQ_POOL: { question: string; answer: string }[] = [
  {
    question: 'How do I join?',
    answer:
      'Please fill out a Sign Up form that you can access on the next screen. Then check your email for more information and a guide to completing the dashboard.'
  },
  {
    question: 'What should I do after I join?',
    answer: 'After you join, follow the instructions based on the email you received for signing up.'
  },
  {
    question: 'Do I need prior experience?',
    answer: 'No experience is required. We have onboarding tracks for every subteam that start from the basics.'
  },
  {
    question: 'How much time is expected each week?',
    answer: 'It varies by subteam and time of year, but most members spend a few hours a week between meetings and bay time.'
  },
  {
    question: 'Can I be on more than one subteam?',
    answer: 'Yes. Many members contribute across subteams — reach out to the relevant leads to get involved.'
  },
  {
    question: 'Where do meetings happen?',
    answer: 'Meeting times and locations are posted in Slack each week in your subteam channel.'
  },
  {
    question: 'How do I get access to the shop?',
    answer: 'Complete the required safety training, then a lead or head can grant you access to the bay.'
  }
];

// Always created (not sampled) — these back the recruiting/new-member/part-review dashboards,
// so every organization needs the full set rather than a random subset like the generic FAQ_POOL above.
export const RECRUITING_FAQ_FIXTURES: { question: string; answer: string }[] = [
  {
    question: 'Who is the Chief Software Engineer?',
    answer: 'Check the Contacts widget on the home page for the current officer roster.'
  },
  {
    question: 'When was this platform created?',
    answer: 'This platform was created in 2019 and has been maintained by the software subteam ever since.'
  },
  {
    question: 'How many developers are working on this platform?',
    answer: 'The size of the software subteam varies by year — ask in the recruiting Slack channel for the current count.'
  }
];

export const NEW_MEMBER_FAQ_FIXTURES: { question: string; answer: string }[] = [
  {
    question: 'Where do I go if I have a question during onboarding?',
    answer: 'Ask in the #new-members Slack channel — no question is too small!'
  },
  {
    question: 'How do I get access to the shop?',
    answer: 'Complete the safety training checklist item and a lead will grant you access.'
  },
  {
    question: 'How long until I officially join a team?',
    answer: 'Once your join request is approved by a lead, head, or admin, you become a full member of that team right away.'
  },
  {
    question: 'Can I request to join more than one team?',
    answer: "Yes! You can submit a request to join any team you're interested in, even after you've already joined one."
  }
];

export const PART_REVIEW_FAQ_FIXTURES: { question: string; answer: string }[] = [
  {
    question: 'What is a part review?',
    answer:
      'A part review allows your team lead to ensure that your part is designed correctly and meets your specified restrictions.'
  },
  {
    question: 'How do I upload for a part review?',
    answer:
      'First, click the button to upload your file. After uploading, make sure all fields are filled out in a way that makes sense for your part, then click submit and let your team lead know!'
  }
];

// Recruiting-cycle milestones, shown on the recruiting dashboard (pre-join).
export const MILESTONE_FIXTURES: { name: string; description: string; dayOffset: number }[] = [
  { name: 'Sign Ups Open!', description: 'Sign up using the form linked on the next page.', dayOffset: -2 },
  { name: 'Winter Fest', description: 'See NER in person at our table during Winter Fest.', dayOffset: -1 },
  { name: 'Info Session 1', description: 'Get to know NER a bit more at our first Info Session!', dayOffset: 0 },
  { name: 'Info Session 2', description: 'Get to know NER a bit more at our second Info Session!', dayOffset: 6 },
  { name: 'COE & Khoury Club Fair', description: 'See our booths at the various club fairs!', dayOffset: 7 },
  { name: 'Bay Open House', description: 'If you miss an info session, come ask questions in the bay!', dayOffset: 8 },
  { name: 'REVD 1', description: 'New mechanical members attend the 1st REVD meeting here.', dayOffset: 10 },
  { name: 'SPARKD 1', description: 'New electrical members attend the 1st SPARKD meeting here.', dayOffset: 11 },
  { name: 'Sign Up Deadline', description: 'Please Sign Up and complete SciShield by this date!', dayOffset: 12 }
];

// Post-join milestones, shown on the new-member dashboard.
export const NEW_MEMBER_MILESTONE_FIXTURES: { name: string; description: string; dayOffset: number }[] = [
  { name: 'First Meeting', description: 'Attend your first general body meeting', dayOffset: -14 },
  { name: 'First Bay Time', description: 'Get hands-on time in the bay with a team lead', dayOffset: -7 },
  {
    name: 'Safety Training Deadline',
    description: 'Complete required safety training to access the bay unsupervised',
    dayOffset: 14
  },
  { name: 'Subteam Placement', description: 'Officially join a subteam project', dayOffset: 30 },
  { name: 'Team Kickoff Meeting', description: 'Meet your new subteam and lead', dayOffset: 37 },
  { name: 'Design Review Shadow', description: 'Sit in on a design review to see how the team works', dayOffset: 45 },
  { name: 'First Project Assignment', description: 'Get assigned your first project task', dayOffset: 52 },
  { name: 'Shop Certification', description: 'Complete machine certification for shop tools', dayOffset: 60 },
  { name: 'Mid-Semester Check-In', description: 'Meet with your lead to discuss progress', dayOffset: 75 },
  { name: 'End of Semester Showcase', description: 'Present what you worked on this semester', dayOffset: 100 }
];

export const CONTACT_TITLE_FIXTURES: string[] = [
  'President',
  'Chief Mechanical Engineer',
  'Chief Electrical Engineer',
  'Chief Operations Officer',
  'Chief Software Engineer'
];

const ANNOUNCEMENT_TEMPLATES = [
  'Bay time today from 3-5! Come work on your tickets.',
  'Weekly meeting moved to Thursday at 6:30 in Snell.',
  'Reminder: submit your reimbursement receipts by Friday.',
  'New members — complete SciShield before visiting the shop.',
  'Design review scheduled for this weekend, check the calendar.',
  'Great work at competition everyone, results are posted!',
  'Sponsorship packets are ready, reach out if you want to help.',
  'Machining time available this week, sign up in the sheet.'
];

const SLACK_CHANNEL_NAMES = [
  'general',
  'new-members',
  'mechanical',
  'electrical',
  'software',
  's_powertrain',
  's_aerodynamics',
  'operations'
];

const POPUP_TEMPLATES: { text: string; iconName: string }[] = [
  { text: 'Applications for heads & leads are open!', iconName: 'campaign' },
  { text: 'Fill out the team census by tonight.', iconName: 'assignment' },
  { text: 'New onboarding guide available in the dashboard.', iconName: 'menu_book' },
  { text: 'Reimbursement deadline is approaching.', iconName: 'payments' },
  { text: 'Check out the latest design review recording.', iconName: 'videocam' }
];

export const GUEST_DEFINITION_TERMS: { term: string; description: string }[] = [
  { term: 'CR', description: 'Change Request — a proposed modification tracked through review and approval.' },
  { term: 'DR', description: 'Design Review — a scheduled evaluation of a design before it moves forward.' },
  { term: 'WP', description: 'Work Package — a scoped unit of work with its own timeline and deliverables.' },
  { term: 'BOM', description: 'Bill of Materials — the full list of parts and materials for a build.' },
  { term: 'Bay', description: 'The team shop space where the car is built and tested.' },
  { term: 'SES', description: 'Structural Equivalency Spreadsheet — a rules-compliance document for the chassis.' },
  { term: 'REVD', description: 'The mechanical onboarding lecture series for new members.' },
  { term: 'SPARKD', description: 'The electrical onboarding lecture series for new members.' }
];

const CHECKLIST_ROOT_TEMPLATES = [
  'Complete onboarding application',
  'Join the team Slack',
  'Attend a safety training',
  'Set up your design software',
  'Follow the GitHub organization',
  'Attend your first subteam meeting'
];

const CHECKLIST_SUBTASK_TEMPLATES = [
  'Fill out the sign-up form',
  'Join #new-members',
  'Update your profile',
  'Download the required tools',
  'Read the onboarding guide',
  'Turn on notifications'
];

export const generateAnnouncementText = (faker: Faker): string => faker.helpers.arrayElement(ANNOUNCEMENT_TEMPLATES);
export const chooseSlackChannel = (faker: Faker): string => faker.helpers.arrayElement(SLACK_CHANNEL_NAMES);
export const generateSenderName = (faker: Faker): string => faker.person.fullName();

export const choosePopUp = (faker: Faker): { text: string; iconName: string } => faker.helpers.arrayElement(POPUP_TEMPLATES);

export const generateChecklistRootContent = (faker: Faker): string => faker.helpers.arrayElement(CHECKLIST_ROOT_TEMPLATES);
export const generateChecklistSubtaskContent = (faker: Faker): string =>
  faker.helpers.arrayElement(CHECKLIST_SUBTASK_TEMPLATES);
export const generateSubtaskCount = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 30, value: 0 },
    { weight: 40, value: 1 },
    { weight: 20, value: 2 },
    { weight: 10, value: 3 }
  ]);

// A recent past date for content creation, relative to now.
export const generateRecentDate = (faker: Faker, now: Date): Date =>
  faker.date.between({ from: addDaysToDate(now, -120), to: now });

export type DashboardPlacement = {
  isOnRecruitingDashboard?: boolean;
  isOnNewMemberDashboard?: boolean;
  isOnPartReviewPage?: boolean;
};

export const faqCreateInput = (
  organizationId: string,
  question: string,
  answer: string,
  userCreatedId: string,
  dateCreated: Date,
  dashboardPlacement: DashboardPlacement = {}
): Prisma.FrequentlyAskedQuestionCreateInput => ({
  question,
  answer,
  dateCreated,
  userCreated: { connect: { userId: userCreatedId } },
  organization: { connect: { organizationId } },
  isOnRecruitingDashboard: dashboardPlacement.isOnRecruitingDashboard ?? false,
  isOnNewMemberDashboard: dashboardPlacement.isOnNewMemberDashboard ?? false,
  isOnPartReviewPage: dashboardPlacement.isOnPartReviewPage ?? false
});

export const milestoneCreateInput = (
  organizationId: string,
  name: string,
  description: string,
  dateOfEvent: Date,
  userCreatedId: string,
  dateCreated: Date,
  dashboardPlacement: Pick<DashboardPlacement, 'isOnRecruitingDashboard' | 'isOnNewMemberDashboard'> = {}
): Prisma.MilestoneCreateInput => ({
  name,
  description,
  dateOfEvent,
  dateCreated,
  userCreated: { connect: { userId: userCreatedId } },
  organization: { connect: { organizationId } },
  isOnRecruitingDashboard: dashboardPlacement.isOnRecruitingDashboard ?? false,
  isOnNewMemberDashboard: dashboardPlacement.isOnNewMemberDashboard ?? false
});

export const contactCreateInput = (organizationId: string, title: string, userId: string): Prisma.ContactCreateInput => ({
  title,
  user: { connect: { userId } },
  organization: { connect: { organizationId } }
});

export const announcementCreateInput = (
  organizationId: string,
  text: string,
  senderName: string,
  slackEventId: string,
  slackChannelName: string,
  dateMessageSent: Date,
  dateDeleted: Date | undefined
): Prisma.AnnouncementCreateInput => ({
  text,
  senderName,
  slackEventId,
  slackChannelName,
  dateMessageSent,
  dateDeleted: dateDeleted ?? null,
  organization: { connect: { organizationId } }
});

export const popUpCreateInput = (
  organizationId: string,
  text: string,
  iconName: string,
  eventLink: string | undefined
): Prisma.PopUpCreateInput => ({
  text,
  iconName,
  eventLink: eventLink ?? null,
  organization: { connect: { organizationId } }
});

export const guestDefinitionCreateInput = (
  organizationId: string,
  term: string,
  description: string,
  order: number,
  type: Guest_Definition_Type,
  userCreatedId: string,
  dateCreated: Date
): Prisma.Guest_DefinitionCreateInput => ({
  term,
  description,
  order,
  type,
  dateCreated,
  userCreated: { connect: { userId: userCreatedId } },
  organization: { connect: { organizationId } }
});

export const checklistCreateInput = (
  organizationId: string,
  content: string,
  itemType: Checklist_Item_Type,
  isOptional: boolean,
  displayIndex: number,
  userCreatedId: string,
  dateCreated: Date,
  parentChecklistId: string | undefined,
  teamTypeId: string | undefined
): Prisma.ChecklistCreateInput => ({
  content,
  itemType,
  isOptional,
  displayIndex,
  dateCreated,
  userCreated: { connect: { userId: userCreatedId } },
  organization: { connect: { organizationId } },
  ...(parentChecklistId ? { parentChecklist: { connect: { checklistId: parentChecklistId } } } : {}),
  ...(teamTypeId ? { teamType: { connect: { teamTypeId } } } : {})
});
