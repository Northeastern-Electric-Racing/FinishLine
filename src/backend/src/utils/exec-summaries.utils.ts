/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Organization, Prisma } from '@prisma/client';
import { BudgetHighlight, calculateProjectEndDate, calculateProjectStartDate, User, wbsPipe } from 'shared';
import prisma from '../prisma/prisma.js';
import { HttpException } from './errors.utils.js';
import { isUserOnTeam } from './teams.utils.js';
import { getUserQueryArgs } from '../prisma-query-args/user.query-args.js';
import {
  getBaseExecutiveSummaryQueryArgs,
  getBudgetProjectQueryArgs
} from '../prisma-query-args/executive-summary.query-args.js';

// rounds a dollar amount to the nearest cent so that splitting across divisions doesn't leave floating point noise
const roundToCents = (amount: number): number => Math.round(amount * 100) / 100;

const getOpsTeam = async (organizationId: string) => {
  const opsTeam = await prisma.team.findFirst({
    where: { operationsTeam: true, organizationId },
    include: {
      head: getUserQueryArgs(organizationId),
      leads: getUserQueryArgs(organizationId),
      members: getUserQueryArgs(organizationId)
    }
  });

  if (!opsTeam) throw new HttpException(500, 'Ops team does not exist!');
  return opsTeam;
};

/**
 * Determines if a user is part of the ops team.
 *
 * Modeled after isUserOnFinanceTeam in reimbursement-requests.utils.ts as requested
 *
 * @param user the user to authenticate
 * @param organizationId the organization id to check if the user is on the ops team
 * @returns whether the user is on the ops team
 * @throws {HttpException} if the ops team is not found in the database
 */
export const isUserOnOpsTeam = async (user: User, organizationId: string): Promise<boolean> => {
  return isUserOnTeam(await getOpsTeam(organizationId), user);
};

/**
 * Calculates the budget by division for an executive summary's car and season.
 * @param organization the organization the executive summary belongs to
 * @param executiveSummary the (already validated) executive summary to calculate the budget for
 * @param teamTypeId optional id of a team type (division); when given, only projects with an active team of that
 * type are counted and the budget is split up by that division's teams instead of by division
 * @returns the budget by division, totals, and highlights
 */
export const calculateBudgetSummary = async (
  organization: Organization,
  executiveSummary: Prisma.Executive_SummaryGetPayload<ReturnType<typeof getBaseExecutiveSummaryQueryArgs>>,
  teamTypeId?: string
) => {
  const { executiveSummaryId, carId, seasonStartDate, seasonEndDate } = executiveSummary;

  const [divisions, projects] = await Promise.all([
    prisma.team_Type.findMany({ where: { organizationId: organization.organizationId }, orderBy: { name: 'asc' } }),
    prisma.project.findMany({
      where: {
        carId,
        wbsElement: { organizationId: organization.organizationId, dateDeleted: null },
        ...(teamTypeId ? { teams: { some: { teamTypeId, dateArchived: null } } } : {})
      },
      orderBy: { wbsElement: { name: 'asc' } },
      ...getBudgetProjectQueryArgs()
    })
  ]);

  // a project is in the season if its work (first work package start to last work package end) overlaps the season
  const projectsInSeason = projects.filter((project) => {
    const start = calculateProjectStartDate(project.workPackages);
    const end = calculateProjectEndDate(project.workPackages);
    if (!start || !end) return false;
    if (seasonStartDate && end < seasonStartDate) return false;
    if (seasonEndDate && start > seasonEndDate) return false;
    return true;
  });

  // each project's budget (and reimbursed spending) is split evenly across the distinct divisions of its active
  // teams so that it is never counted more than once; projects with no active team are reported as unassigned
  const UNASSIGNED_LABEL = 'Unassigned';
  const buckets = new Map<string, { label: string; budget: number; spent: number }>(
    divisions.map((division) => [division.teamTypeId, { label: division.name, budget: 0, spent: 0 }])
  );
  const unassigned = { label: UNASSIGNED_LABEL, budget: 0, spent: 0 };
  const teamBuckets = new Map<string, { label: string; budget: number; spent: number }>();
  let mostOverbudgetProject: BudgetHighlight | undefined;
  projectsInSeason.forEach((project) => {
    // spending is charged to the project itself or to any of its work packages
    // reimbursement product costs are stored in cents
    const reasons = [
      ...project.wbsElement.reimbursementProductReasons,
      ...project.workPackages.flatMap((wp) => wp.wbsElement.reimbursementProductReasons)
    ];
    const spent = reasons.reduce((sum, reason) => sum + (reason.reimbursementProduct?.cost ?? 0), 0) / 100;

    const projectOverage = roundToCents(spent - project.budget);
    if (projectOverage > (mostOverbudgetProject?.amount ?? 0)) {
      mostOverbudgetProject = {
        label: `${wbsPipe(project.wbsElement)} - ${project.wbsElement.name}`,
        amount: projectOverage
      };
    }

    // when filtering to one division, split it up by that division's individual teams instead
    if (teamTypeId) {
      const typeTeams = project.teams.filter((team) => !team.dateArchived && team.teamTypeId === teamTypeId);
      typeTeams.forEach((team) => {
        const bucket = teamBuckets.get(team.teamId) ?? { label: team.teamName, budget: 0, spent: 0 };
        bucket.budget += project.budget / typeTeams.length;
        bucket.spent += spent / typeTeams.length;
        teamBuckets.set(team.teamId, bucket);
      });
      return;
    }

    const divisionIds = new Set<string>();
    project.teams.forEach((team) => {
      if (!team.dateArchived && team.teamTypeId && buckets.has(team.teamTypeId)) {
        divisionIds.add(team.teamTypeId);
      }
    });
    const targets = divisionIds.size === 0 ? [unassigned] : [...divisionIds].map((id) => buckets.get(id)!);
    targets.forEach((bucket) => {
      bucket.budget += project.budget / targets.length;
      bucket.spent += spent / targets.length;
    });
  });

  // when filtering to one division, report that division's teams (ordered by name) instead of the divisions
  const allBuckets = teamTypeId
    ? [...teamBuckets.values()].sort((a, b) => a.label.localeCompare(b.label))
    : [...buckets.values()];
  if (!teamTypeId && (unassigned.budget > 0 || unassigned.spent > 0)) allBuckets.push(unassigned);

  const budgetByDivision = {
    tipLabel: 'Dollars',
    values: allBuckets.map(({ label, budget }) => ({ label, value: roundToCents(budget) }))
  };
  const spentByDivision = {
    tipLabel: 'Dollars',
    values: allBuckets.map(({ label, spent }) => ({ label, value: roundToCents(spent) }))
  };

  // strict comparisons so that ties go to the first bucket (divisions are ordered by name)
  let mostExpensiveDivision: BudgetHighlight | undefined;
  let mostOverbudgetDivision: BudgetHighlight | undefined;
  const overbudgetDivisions: BudgetHighlight[] = [];
  allBuckets.forEach(({ label, budget, spent }) => {
    const roundedSpent = roundToCents(spent);
    const overage = roundToCents(spent - budget);
    if (roundedSpent > (mostExpensiveDivision?.amount ?? 0)) {
      mostExpensiveDivision = { label, amount: roundedSpent };
    }
    if (overage > (mostOverbudgetDivision?.amount ?? 0)) {
      mostOverbudgetDivision = { label, amount: overage };
    }
    if (overage > 0) overbudgetDivisions.push({ label, amount: overage });
  });
  // most overbudget first; the sort is stable so ties keep the division name order
  overbudgetDivisions.sort((a, b) => b.amount - a.amount);

  const totalBudget = roundToCents(allBuckets.reduce((sum, { budget }) => sum + budget, 0));
  const totalSpent = roundToCents(allBuckets.reduce((sum, { spent }) => sum + spent, 0));

  return {
    executiveSummaryId,
    budgetByDivision,
    spentByDivision,
    totalBudget,
    totalSpent,
    mostExpensiveDivision,
    mostOverbudgetDivision,
    overbudgetDivisions,
    mostOverbudgetProject
  };
};
