/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import prisma from './prisma.js';
import { Reimbursement_Status_Type, WBS_Element_Status } from '@prisma/client';
import { calculateEndDate } from 'shared';
import { writeFileSync } from 'fs';
import { getUserFullName } from '../utils/users.utils.js';

/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * This file is purely used for DevOps and database management.
 * @see {@link https://github.com/Northeastern-Electric-Racing/FinishLine/blob/develop/docs/Deployment.md docs/Deployment.md} for details
 */

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
