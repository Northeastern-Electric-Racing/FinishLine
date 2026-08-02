/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import prisma from './prisma.js';
import { Reimbursement_Status_Type, WBS_Element_Status } from '@prisma/client';
import { calculateEndDate } from 'shared';
import { writeFileSync } from 'fs';
import { getUserFullName } from '../utils/users.utils.js';
import ProjectsService from '../services/projects.services.js';
import RecruitmentServices from '../services/recruitment.services.js';
import CalendarService from '../services/calendar.services.js';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * This file is purely used for DevOps and database management.
 * @see {@link https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/Deployment.md docs/Deployment.md} for details
 */

/**
 * One-off backfill for an existing dev DB that's missing the recruitment milestones, FAQs, and
 * onboarding/new-member-dashboard useful link types + links that seed.ts creates on a fresh DB.
 * Safe to re-run -- everything is checked for existence first.
 */
export const seedMissingOnboardingRecruitmentContent = async () => {
  const ner = await prisma.organization.findFirstOrThrow({ where: { name: 'Northeastern Electric Racing' } });
  const submitter = await prisma.user.findFirstOrThrow({ where: { email: 'pyle.c@northeastern.edu' } });

  const daysAgo = (days: number): Date => new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const daysFromNow = (days: number): Date => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const recruitingDashboardOnly = { isOnNewMemberDashboard: false, isOnRecruitingDashboard: true };
  const newMemberDashboardOnly = { isOnNewMemberDashboard: true, isOnRecruitingDashboard: false };

  /** Milestones */
  const milestones: [string, string, Date, { isOnNewMemberDashboard: boolean; isOnRecruitingDashboard: boolean }][] = [
    ['Club fair!', 'Also meet us at:', daysAgo(120), recruitingDashboardOnly],
    ['Applications Open', '', daysAgo(70), recruitingDashboardOnly],
    ['Applications Close', '', daysAgo(56), recruitingDashboardOnly],
    ['Decision Day!', '', daysAgo(49), recruitingDashboardOnly],
    ['First Meeting', 'Attend your first general body meeting', daysAgo(14), newMemberDashboardOnly],
    ['First Bay Time', 'Get hands-on time in the bay with a team lead', daysAgo(7), newMemberDashboardOnly],
    [
      'Safety Training Deadline',
      'Complete required safety training to access the bay unsupervised',
      daysFromNow(14),
      newMemberDashboardOnly
    ],
    ['Subteam Placement', 'Officially join a subteam project', daysFromNow(30), newMemberDashboardOnly]
  ];

  for (const [name, description, dateOfEvent, dashboards] of milestones) {
    const exists = await prisma.milestone.findFirst({ where: { name, organizationId: ner.organizationId } });
    if (exists) continue;
    await RecruitmentServices.createMilestone(submitter, name, description, dateOfEvent, dashboards, ner);
    console.log(`Created milestone: ${name}`);
  }

  /** FAQs */
  const faqs: [string, string, boolean, boolean, boolean][] = [
    ['Who is the Chief Software Engineer?', 'Peyton McKee', true, false, false],
    ['When was FinishLine created?', 'FinishLine was created in 2019', true, false, false],
    ['How many developers are working on FinishLine?', '178 as of 2024', true, false, false],
    [
      'Where do I go if I have a question during onboarding?',
      'Ask in the #new-members Slack channel — no question is too small!',
      false,
      true,
      false
    ],
    [
      'How do I get access to the shop?',
      'Complete the safety training checklist item and a lead will grant you access.',
      false,
      true,
      false
    ],
    [
      'How long until I officially join a team?',
      'Once your join request is approved by a lead, head, or admin, you become a full member of that team right away.',
      false,
      true,
      false
    ],
    [
      'Can I request to join more than one team?',
      "Yes! You can submit a request to join any team you're interested in, even after you've already joined one.",
      false,
      true,
      false
    ]
  ];

  for (const [question, answer, isOnRecruitingDashboard, isOnNewMemberDashboard, isOnPartReviewPage] of faqs) {
    const exists = await prisma.frequentlyAskedQuestion.findFirst({
      where: { question, organizationId: ner.organizationId }
    });
    if (exists) continue;
    await RecruitmentServices.createOrganizationFaq(
      submitter,
      question,
      answer,
      ner,
      isOnRecruitingDashboard,
      isOnNewMemberDashboard,
      isOnPartReviewPage
    );
    console.log(`Created FAQ: ${question}`);
  }

  /** Onboarding-page + new-member-dashboard useful link types */
  const linkTypes: [string, string, boolean, boolean][] = [
    // isOnNewMemberDashboard, isOnOnboardingDashboard
    ['Confluence', 'description', false, true],
    ['Bill of Materials', 'bar_chart', false, true],
    ['NER Website', 'bar_chart', false, true],
    ['NER Instagram', 'bar_chart', false, true],
    ['Google Drive', 'folder', false, true],
    ['NER Handbook', 'menu_book', true, false],
    ['Team Directory', 'groups', true, false],
    ['NER Merch Store', 'storefront', true, false]
  ];

  for (const [name, iconName, isOnNewMemberDashboard, isOnOnboardingDashboard] of linkTypes) {
    const exists = await prisma.link_Type.findUnique({
      where: { uniqueLinkType: { name, organizationId: ner.organizationId } }
    });
    if (exists) continue;
    await ProjectsService.createLinkType(
      submitter,
      name,
      iconName,
      true,
      ner,
      false,
      isOnNewMemberDashboard,
      isOnOnboardingDashboard
    );
    console.log(`Created link type: ${name}`);
  }

  /** Useful links (URLs) -- added one at a time, only if the org doesn't already have a useful
   * link of that link type, so this never touches/replaces any existing links */
  const usefulLinks: [string, string][] = [
    ['Confluence', 'https://confluence.com'],
    ['Bill of Materials', 'https://docs.google.com'],
    ['NER Website', 'https://electricracing.northeastern.edu/'],
    ['NER Instagram', 'https://www.instagram.com/nuelectricracing/'],
    ['NER Handbook', 'https://electricracing.northeastern.edu/handbook'],
    ['Team Directory', 'https://electricracing.northeastern.edu/teams'],
    ['NER Merch Store', 'https://electricracing.northeastern.edu/store']
  ];

  const orgWithLinks = await prisma.organization.findUniqueOrThrow({
    where: { organizationId: ner.organizationId },
    include: { usefulLinks: { include: { linkType: true } } }
  });
  const existingLinkTypeNames = new Set(orgWithLinks.usefulLinks.map((link) => link.linkType.name));

  for (const [linkTypeName, url] of usefulLinks) {
    if (existingLinkTypeNames.has(linkTypeName)) continue;

    const linkType = await prisma.link_Type.findUniqueOrThrow({
      where: { uniqueLinkType: { name: linkTypeName, organizationId: ner.organizationId } }
    });

    const newLink = await prisma.link.create({
      data: {
        url,
        linkType: { connect: { id: linkType.id } },
        creator: { connect: { userId: submitter.userId } }
      }
    });

    await prisma.organization.update({
      where: { organizationId: ner.organizationId },
      data: { usefulLinks: { connect: { linkId: newLink.linkId } } }
    });

    console.log(`Added useful link: ${linkTypeName}`);
  }
};

/**
 * One-off fix for an existing dev DB: the "New Member Events" calendar already exists with the
 * "Educational" event type attached and real events on it, but the calendar's isNewMemberCalendar
 * flag was never set, so the new member dashboard's events widget (which only looks at the
 * calendar flagged isNewMemberCalendar: true) always came up empty. All of that calendar's
 * existing events are also in the past, so a few new upcoming ones are added too.
 * Safe to re-run -- the calendar flip is idempotent, and events are only added if missing by title.
 */
export const fixNewMemberEventsCalendar = async () => {
  const ner = await prisma.organization.findFirstOrThrow({ where: { name: 'Northeastern Electric Racing' } });
  const submitter = await prisma.user.findFirstOrThrow({ where: { email: 'pyle.c@northeastern.edu' } });

  const newMemberCalendar = await prisma.calendar.findFirstOrThrow({
    where: { organizationId: ner.organizationId, name: 'New Member Events', dateDeleted: null }
  });

  if (!newMemberCalendar.isNewMemberCalendar) {
    await CalendarService.editCalendar(
      submitter,
      newMemberCalendar.calendarId,
      newMemberCalendar.name,
      newMemberCalendar.description,
      newMemberCalendar.colorHexCode,
      true,
      ner
    );
    console.log('Flagged "New Member Events" as the new member calendar');
  }

  const educationalEventType = await prisma.event_Type.findFirstOrThrow({
    where: { organizationId: ner.organizationId, name: 'Educational', dateDeleted: null }
  });

  const teamTypes = await prisma.team_Type.findMany({ where: { organizationId: ner.organizationId } });
  const teamTypeIdByName = new Map(teamTypes.map((teamType) => [teamType.name, teamType.teamTypeId]));

  const daysFromNow = (days: number): Date => new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const events: {
    title: string;
    teamTypeName: string;
    start: Date;
    durationMinutes: number;
    location?: string;
    zoomLink?: string;
    description: string;
  }[] = [
    {
      title: 'New Member Mixer',
      teamTypeName: 'Electrical',
      start: daysFromNow(7),
      durationMinutes: 60,
      location: 'Curry Student Center',
      description: 'Come meet the team!'
    },
    {
      title: 'New Member Bay Time',
      teamTypeName: 'Mechanical',
      start: daysFromNow(14),
      durationMinutes: 60,
      location: 'Richards Hall',
      description: 'Hands-on time in the bay with the mechanical team'
    },
    {
      title: 'New Member Software Onboarding',
      teamTypeName: 'Software',
      start: daysFromNow(21),
      durationMinutes: 90,
      zoomLink: 'https://zoom.us/j/123456789',
      description: 'Intro to the FinishLine codebase'
    }
  ];

  for (const event of events) {
    const exists = await prisma.event.findFirst({
      where: { title: event.title, eventTypeId: educationalEventType.eventTypeId, dateDeleted: null }
    });
    if (exists) continue;

    const teamTypeId = teamTypeIdByName.get(event.teamTypeName);
    if (!teamTypeId) {
      console.log(`Skipping "${event.title}" -- no "${event.teamTypeName}" team type found`);
      continue;
    }

    await CalendarService.createEvent(
      submitter,
      event.title,
      educationalEventType.eventTypeId,
      ner,
      [],
      [],
      [],
      [],
      [],
      [],
      [
        {
          startTime: event.start,
          endTime: new Date(event.start.getTime() + event.durationMinutes * 60 * 1000),
          allDay: false
        }
      ],
      undefined,
      [],
      teamTypeId,
      undefined,
      event.location,
      event.zoomLink,
      event.description
    );
    console.log(`Created event: ${event.title}`);
  }
};

/** Execute all given prisma database interaction scripts written in this function */
const executeScripts = async () => {};

/**
 * Print count of total work packages
 */
export const countWorkPackages = async () => {
  const res = await prisma.work_Package.count();
  console.log('total work packages:', res);
};

/**
 * Calculate active users by week
 */
export const activeUserMetrics = async () => {
  // sad dev doesn't feel like converting SQL to Prisma
  // select extract(week from "created") as wk, count(distinct "userId") as "# users", count(distinct "sessionId") as "# sessions" from "Session" group by wk order by wk;
};

/**
 * Print basic change request metrics
 * Note: timeline/budget impact metrics were removed in the CR descoping migration (see 20260420_descoping_change_requests)
 */
export const pullCRMetrics = async () => {
  const nums = await Promise.all([
    '# of CRs',
    prisma.change_Request.count(),
    '# of CRs accepted',
    prisma.change_Request.count({ where: { accepted: true } }),
    '# of CRs denied',
    prisma.change_Request.count({ where: { accepted: false } }),
    '# of CRs open',
    prisma.change_Request.count({ where: { accepted: null } }),
    '# of STANDARD CRs',
    prisma.change_Request.count({ where: { type: 'STANDARD' } }),
    '# of ACTIVATION CRs',
    prisma.change_Request.count({ where: { type: 'ACTIVATION' } }),
    '# of STAGE_GATE CRs',
    prisma.change_Request.count({ where: { type: 'STAGE_GATE' } }),
    '# of BUDGET CRs',
    prisma.change_Request.count({ where: { type: 'BUDGET' } }),
    '# of LEADERSHIP CRs',
    prisma.change_Request.count({ where: { type: 'LEADERSHIP' } })
  ]);
  for (let idx = 0; idx < nums.length; idx += 2) {
    console.log(nums[idx], nums[idx + 1]);
  }
};

/**
 * Migrate all complete wps to have checked description bullets
 */
export const migrateToCheckableDescBullets = async () => {
  const wps = await prisma.work_Package.findMany({
    where: { wbsElement: { status: WBS_Element_Status.COMPLETE } },
    include: { wbsElement: true }
  });

  wps.forEach(async (wp) => {
    // 1 is James' id
    const { leadId } = wp.wbsElement;

    await prisma.description_Bullet.updateMany({
      where: { wbsElement: { project: null } },
      data: { dateTimeChecked: calculateEndDate(wp.startDate, wp.duration), userCheckedId: leadId }
    });
  });
};

/**
 * Download All Reimbursement Requests with reimbursement status to csv
 */
const downloadReimbursementRequests = async () => {
  const rrs = await prisma.reimbursement_Request.findMany({
    where: {
      dateDeleted: null
    },
    include: { reimbursementStatuses: true, vendor: true, indexCode: true }
  });

  const promises = rrs.map(
    async (rr) =>
      await `${rr.saboId},${await getUserFullName(rr.recipientId)},${rr.totalCost},${
        rr.reimbursementStatuses[rr.reimbursementStatuses.length - 1].type
      },${rr.indexCode},${rr.dateCreated},${rr.dateDelivered ?? ''},${
        rr.reimbursementStatuses.find((rs) => rs.type === Reimbursement_Status_Type.SABO_SUBMITTED)?.dateCreated ?? ''
      },${rr.vendor.name}`
  );

  const csv = await Promise.all(promises);

  writeFileSync('./reimbursements.csv', csv.join('\n'), 'utf-8');
};

const getTotalAmountOwedForCashAndBudgetForSubmittedToSaboAndPendingFinanceTeam = async () => {
  const reimbursementRequests = await prisma.reimbursement_Request.findMany({
    where: {
      dateDeleted: null
    },
    include: {
      reimbursementStatuses: true,
      indexCode: true
    }
  });

  const submittedToSabo = reimbursementRequests.filter(
    (rr) => rr.reimbursementStatuses[rr.reimbursementStatuses.length - 1].type === Reimbursement_Status_Type.SABO_SUBMITTED
  );

  const pendingFinance = reimbursementRequests.filter(
    (rr) => rr.reimbursementStatuses[rr.reimbursementStatuses.length - 1].type === Reimbursement_Status_Type.PENDING_FINANCE
  );

  const totalAmountOwedForCashSabo = submittedToSabo.reduce((acc, curr) => {
    if (curr.indexCode.name === 'CASH') {
      return acc + curr.totalCost / 100;
    }
    return 0;
  }, 0);

  const totalAmountOwedForBudgetSabo = submittedToSabo.reduce((acc, curr) => {
    if (curr.indexCode.name === 'Budget') {
      return acc + curr.totalCost / 100;
    }
    return acc + 0;
  }, 0);

  const totalAmountOwedForCashFinance = pendingFinance.reduce((acc, curr) => {
    if (curr.indexCode.name === 'Cash') {
      return acc + curr.totalCost / 100;
    }
    return acc + 0;
  }, 0);

  const totalAmountOwedForBudgetFinance = pendingFinance.reduce((acc, curr) => {
    if (curr.indexCode.name === 'Budget') {
      return acc + curr.totalCost / 100;
    }
    return acc + 0;
  }, 0);

  console.log('Total amount owed for cash submitted to SABO:', totalAmountOwedForCashSabo);
  console.log('Total amount owed for budget submitted to SABO:', totalAmountOwedForBudgetSabo);
  console.log('Total amount owed for cash pending finance team:', totalAmountOwedForCashFinance);
  console.log('Total amount owed for budget pending finance team:', totalAmountOwedForBudgetFinance);
};

executeScripts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Done!');
  });
