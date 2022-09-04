/*
 * This file is part of NER's PM Dashboard and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import prisma from './prisma';
import { Role } from '@prisma/client';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * This file is purely used for DevOps and database management.
 * @see {@link https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/Deployment.md docs/Deployment.md} for details
 */

/** Execute all given prisma database interaction scripts written in this function */
const executeScripts = async () => {};

/**
 * Update user's role given userId and new role
 * Example: await setUserRole(8, Role.MEMBER);
 */
const setUserRole = async (id: number, role: Role) => {
  await prisma.user.update({ where: { userId: id }, data: { role } });
};

/**
 * Print metrics on accepted Change Requests with timeline impact
 */
const checkTimelineImpact = async () => {
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
const countWorkPackages = async () => {
  const res = await prisma.work_Package.count();
  console.log('total work packages:', res);
};

/**
 * Calculate active users by week
 */
const activeUserMetrics = async () => {
  // sad dev doesn't feel like converting SQL to Prisma
  // select extract(week from "created") as wk, count(distinct "userId") as "# users", count(distinct "sessionId") as "# sessions" from "Session" group by wk order by wk;
};

/**
 * Calculate, pull, and print various metrics per request from Anushka.
 */
const pullNumbersForPM = async () => {
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
const migrateToProposedSolutions = async () => {
  const crs = await prisma.scope_CR.findMany({ include: { changeRequest: true } });
  crs.forEach(async (cr) => {
    const alreadyHasSolution = await prisma.proposed_Solution.findFirst({
      where: { changeRequestId: cr.scopeCrId }
    });

    if (!alreadyHasSolution) {
      await prisma.proposed_Solution.create({
        data: {
          description: '',
          timelineImpact: cr.timelineImpact,
          scopeImpact: cr.scopeImpact,
          budgetImpact: cr.budgetImpact,
          changeRequestId: cr.scopeCrId,
          createdByUserId: cr.changeRequest.submitterId,
          dateCreated: cr.changeRequest.dateSubmitted,
          approved: cr.changeRequest.accepted ?? false
        }
      });
    }
  });
};

/**
 * Manually create two team via direct db. (for dev use only lol)
 */
const createTeams = async (name: string, slack: string, name2: string, slack2: string) => {
  const res = await prisma.team.create({
    data: {
      teamName: name,
      slackId: slack,
      leader: { connect: { userId: 1 } },
      projects: { connect: [{ projectId: 1 }, { projectId: 2 }] },
      members: { connect: [{ userId: 2 }, { userId: 3 }] }
    }
  });
  console.log(res);

  const res2 = await prisma.team.create({
    data: {
      teamName: name2,
      slackId: slack2,
      leader: { connect: { userId: 2 } },
      projects: { connect: [{ projectId: 3 }, { projectId: 4 }, { projectId: 5 }] },
      members: { connect: [{ userId: 4 }, { userId: 5 }] }
    }
  });
  console.log(res2);
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
