/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import prisma from './prisma';
import { WBS_Element_Status } from '@prisma/client';
import { calculateEndDate } from 'shared';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * This file is purely used for DevOps and database management.
 * @see {@link https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/Deployment.md docs/Deployment.md} for details
 */

/** Execute all given prisma database interaction scripts written in this function */
const executeScripts = async () => {};

/**
 * Print metrics on accepted Change Requests with timeline impact
 */
export const checkTimelineImpact = async () => {
  const res = await prisma.change_Request.findMany({
    where: {
      accepted: true,
      scopeChangeRequest: {
        timelineImpact: {
          gt: 0
        }
      }
    },
    include: {
      scopeChangeRequest: true
    }
  });
  const calc = res.reduce((acc, curr) => {
    return acc + (curr.scopeChangeRequest?.timelineImpact || 0);
  }, 0);
  console.log('total accepted CRs w/ timeline impact:', res.length);
  console.log('total accepted delays', calc, 'weeks');
};

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
 * Calculate, pull, and print various metrics per request from Anushka.
 */
export const pullNumbersForPM = async () => {
  const nums = await Promise.all([
    '# of CRs',
    prisma.change_Request.count(),
    '# of CRs accepted',
    prisma.change_Request.count({ where: { accepted: true } }),
    '# of CRs denied',
    prisma.change_Request.count({ where: { accepted: false } }),
    '# of CRs open',
    prisma.change_Request.count({ where: { accepted: null } }),
    '# w/ timeline impact > 0',
    prisma.change_Request.count({ where: { scopeChangeRequest: { timelineImpact: { gt: 0 } } } }),
    '# w/ timeline impact > 0 ISSUE',
    prisma.change_Request.count({
      where: { scopeChangeRequest: { timelineImpact: { gt: 0 } }, type: 'ISSUE' }
    }),
    '# w/ timeline impact > 0 DEFINITION_CHANGE',
    prisma.change_Request.count({
      where: { scopeChangeRequest: { timelineImpact: { gt: 0 } }, type: 'DEFINITION_CHANGE' }
    }),
    '# w/ timeline impact > 0 OTHER',
    prisma.change_Request.count({
      where: { scopeChangeRequest: { timelineImpact: { gt: 0 } }, type: 'OTHER' }
    }),
    'w/ timeline impact > 0 AVG TIMELINE IMPACT',
    prisma.scope_CR.aggregate({
      _avg: { timelineImpact: true },
      where: { timelineImpact: { gt: 0 } }
    }),
    'timeline impact = 0',
    prisma.scope_CR.count({ where: { timelineImpact: { equals: 0 } } }),
    'timeline impact >0 and <=2',
    prisma.scope_CR.count({ where: { timelineImpact: { gt: 0, lte: 2 } } }),
    'timeline impact >2 and <=4',
    prisma.scope_CR.count({ where: { timelineImpact: { gt: 2, lte: 4 } } }),
    'timeline impact >4 and <=8',
    prisma.scope_CR.count({ where: { timelineImpact: { gt: 4, lte: 8 } } }),
    'timeline impact >8 and <=16',
    prisma.scope_CR.count({ where: { timelineImpact: { gt: 8, lte: 16 } } }),
    'timeline impact >8',
    prisma.scope_CR.count({ where: { timelineImpact: { gt: 16 } } })
  ]);
  for (let idx = 0; idx < nums.length; idx += 2) {
    console.log(nums[idx], nums[idx + 1]);
  }
};

/**
 * migrate all Change Requests to use Proposed Solutions
 */
export const migrateToProposedSolutions = async () => {
  const crs = await prisma.scope_CR.findMany({ include: { changeRequest: true } });
  crs.forEach(async (cr) => {
    const alreadyHasSolution = await prisma.proposed_Solution.findFirst({
      where: { scopeChangeRequestId: cr.scopeCrId }
    });

    if (!alreadyHasSolution) {
      await prisma.proposed_Solution.create({
        data: {
          description: '',
          timelineImpact: cr.timelineImpact,
          scopeImpact: cr.scopeImpact,
          budgetImpact: cr.budgetImpact,
          scopeChangeRequestId: cr.scopeCrId,
          createdByUserId: cr.changeRequest.submitterId,
          dateCreated: cr.changeRequest.dateSubmitted,
          approved: cr.changeRequest.accepted ?? false
        }
      });
    }
  });
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

executeScripts()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Done!');
  });
