/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Organization } from '@prisma/client';
import {
  BudgetHighlight,
  calculateProjectEndDate,
  calculateProjectStartDate,
  isAdmin,
  notGuest,
  User,
  wbsPipe
} from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';
import { getUserQueryArgs } from '../prisma-query-args/user.query-args.js';
import { isUserOnOpsTeam } from '../utils/exec-summaries.utils.js';
import {
  getBaseCompetitionDocumentsSummaryQueryArgs,
  getBaseCompetitionPerformanceQueryArgs,
  getBaseExecutiveSummaryQueryArgs,
  getBaseRecruitmentCycleQueryArgs,
  getBaseRecruitmentDivisionCountQueryArgs,
  getBudgetProjectQueryArgs,
  getVehicleDevelopmentProjectQueryArgs
} from '../prisma-query-args/executive-summary.query-args.js';
import {
  executiveSummaryTransformer,
  vehicleDevelopmentSummaryTransformer,
  competitionPerformanceTransformer
} from '../transformers/executive-summary.transformer.js';

// rounds a dollar amount to the nearest cent so that splitting across divisions doesn't leave floating point noise
const roundToCents = (amount: number): number => Math.round(amount * 100) / 100;

export default class ExecSummaryServices {
  /**
   * Edits an existing executive summary.
   * @param submitter the user editing the executive summary
   * @param organization the organization the executive summary belongs to
   * @param goals the updated goals
   * @param winsAndImprovements the updated wins and improvements
   * @param budgetNotes the updated budget notes
   * @param recruitmentNotes the updated recruitment notes
   * @param seasonStartDate the updated season start date, or null to leave/clear it
   * @param seasonEndDate the updated season end date, or null to leave/clear it
   * @param executiveSummaryId the id of the executive summary being edited
   * @returns the updated executive summary
   * @throws AccessDeniedException if the submitter is not an admin and not on the ops team
   * @throws NotFoundException if the executive summary does not exist
   * @throws InvalidOrganizationException if the executive summary belongs to a different organization
   * @throws DeletedException if the executive summary has been deleted
   * @throws HttpException if the resolved season end date is before the resolved season start date
   */
  static async editExecutiveSummary(
    submitter: User,
    organization: Organization,
    goals: string,
    winsAndImprovements: string,
    budgetNotes: string,
    recruitmentNotes: string,
    seasonStartDate: Date | null,
    seasonEndDate: Date | null,
    executiveSummaryId: string
  ) {
    const isAdminUser = await userHasPermission(submitter.userId, organization.organizationId, isAdmin);

    if (!isAdminUser) {
      let isOpsTeamMember = false;
      try {
        isOpsTeamMember = await isUserOnOpsTeam(submitter, organization.organizationId);
      } catch {
        // Ops team may not exist yet
      }
      if (!isOpsTeamMember) throw new AccessDeniedException('edit an executive summary');
    }

    const currentExecutiveSummary = await prisma.executive_Summary.findUnique({
      where: { executiveSummaryId },
      ...getBaseExecutiveSummaryQueryArgs()
    });

    if (!currentExecutiveSummary) {
      throw new NotFoundException('Executive Summary', executiveSummaryId);
    }

    if (currentExecutiveSummary.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Executive Summary');
    }

    if (currentExecutiveSummary.dateDeleted) {
      throw new DeletedException('Executive Summary', executiveSummaryId);
    }

    // Compare the resolved dates (new value if provided, otherwise whatever's already stored)
    // so this still catches a bad ordering even if only one of the two dates is being changed.
    const resolvedStartDate = seasonStartDate ?? currentExecutiveSummary.seasonStartDate;
    const resolvedEndDate = seasonEndDate ?? currentExecutiveSummary.seasonEndDate;

    if (resolvedStartDate && resolvedEndDate && resolvedEndDate < resolvedStartDate) {
      throw new HttpException(400, 'Season end date cannot be before season start date');
    }

    const updatedExecutiveSummary = await prisma.executive_Summary.update({
      where: { executiveSummaryId },
      data: {
        goals,
        winsAndImprovements,
        budgetNotes,
        recruitmentNotes,
        seasonStartDate,
        seasonEndDate
      },
      select: {
        ...getBaseExecutiveSummaryQueryArgs().select,
        goals: true,
        winsAndImprovements: true,
        budgetNotes: true,
        recruitmentNotes: true,
        userCreated: getUserQueryArgs(organization.organizationId),
        deletedBy: getUserQueryArgs(organization.organizationId),
        competitionPerformances: getBaseCompetitionPerformanceQueryArgs(),
        competitionDocumentsSummary: getBaseCompetitionDocumentsSummaryQueryArgs(),
        recruitmentCycles: {
          orderBy: { term: 'asc' },
          select: {
            ...getBaseRecruitmentCycleQueryArgs().select,
            divisionCounts: getBaseRecruitmentDivisionCountQueryArgs()
          }
        }
      }
    });

    return executiveSummaryTransformer(updatedExecutiveSummary);
  }

  /**
   * Gets a single executive summary by id.
   * @param organization the organization the executive summary belongs to
   * @param executiveSummaryId the id of the executive summary to retrieve
   * @param viewer the user requesting the executive summary
   * @returns the requested executive summary
   * @throws AccessDeniedException if the viewer is a guest
   * @throws NotFoundException if the executive summary does not exist
   * @throws InvalidOrganizationException if the executive summary belongs to a different organization
   * @throws DeletedException if the executive summary has been deleted
   */
  static async getSingleExecutiveSummary(organization: Organization, executiveSummaryId: string, viewer: User) {
    const hasPermission = await userHasPermission(viewer.userId, organization.organizationId, notGuest);
    if (!hasPermission) {
      throw new AccessDeniedException('Only members can view executive summaries');
    }

    const executiveSummary = await prisma.executive_Summary.findUnique({
      where: { executiveSummaryId },
      select: {
        ...getBaseExecutiveSummaryQueryArgs().select,
        goals: true,
        winsAndImprovements: true,
        budgetNotes: true,
        recruitmentNotes: true,
        userCreated: getUserQueryArgs(organization.organizationId),
        deletedBy: getUserQueryArgs(organization.organizationId),
        competitionPerformances: getBaseCompetitionPerformanceQueryArgs(),
        competitionDocumentsSummary: getBaseCompetitionDocumentsSummaryQueryArgs(),
        recruitmentCycles: {
          orderBy: { term: 'asc' },
          select: {
            ...getBaseRecruitmentCycleQueryArgs().select,
            divisionCounts: getBaseRecruitmentDivisionCountQueryArgs()
          }
        }
      }
    });

    if (!executiveSummary) {
      throw new NotFoundException('Executive Summary', executiveSummaryId);
    }
    if (executiveSummary.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Executive Summary');
    }
    if (executiveSummary.dateDeleted) {
      throw new DeletedException('Executive Summary', executiveSummaryId);
    }

    return executiveSummaryTransformer(executiveSummary);
  }

  static async getAllExecutiveSummaries(organization: Organization, viewer: User) {
    const hasPermission = await userHasPermission(viewer.userId, organization.organizationId, notGuest);
    if (!hasPermission) {
      throw new AccessDeniedException('Only members can view executive summaries');
    }

    const executiveSummaries = await prisma.executive_Summary.findMany({
      where: { car: { wbsElement: { organizationId: organization.organizationId } }, dateDeleted: null },
      select: {
        ...getBaseExecutiveSummaryQueryArgs().select,
        goals: true,
        winsAndImprovements: true,
        budgetNotes: true,
        recruitmentNotes: true,
        userCreated: getUserQueryArgs(organization.organizationId),
        deletedBy: getUserQueryArgs(organization.organizationId),
        competitionPerformances: getBaseCompetitionPerformanceQueryArgs(),
        competitionDocumentsSummary: getBaseCompetitionDocumentsSummaryQueryArgs(),
        recruitmentCycles: {
          orderBy: { term: 'asc' },
          select: {
            ...getBaseRecruitmentCycleQueryArgs().select,
            divisionCounts: getBaseRecruitmentDivisionCountQueryArgs()
          }
        }
      }
    });

    return executiveSummaries.map(executiveSummaryTransformer);
  }

  /**
   * Gets the vehicle development data (projects over time) for an executive summary's season.
   * @param organization the organization the executive summary belongs to
   * @param executiveSummaryId the id of the executive summary
   * @param viewer the user requesting the data
   * @param teamId optional team id; when provided only that team's projects are returned
   * @returns the projects overlapping the executive summary's season, with their teams and dates
   * @throws AccessDeniedException if the viewer is a guest
   * @throws NotFoundException if the executive summary does not exist
   * @throws InvalidOrganizationException if the executive summary belongs to a different organization
   * @throws DeletedException if the executive summary has been deleted
   * @throws NotFoundException if the team id is provided and the team does not exist
   * @throws InvalidOrganizationException if the team belongs to a different organization
   */
  static async getVehicleDevelopmentSummary(
    organization: Organization,
    executiveSummaryId: string,
    viewer: User,
    teamId?: string
  ) {
    const hasPermission = await userHasPermission(viewer.userId, organization.organizationId, notGuest);
    if (!hasPermission) {
      throw new AccessDeniedException('Only members can view executive summaries');
    }

    const executiveSummary = await prisma.executive_Summary.findUnique({
      where: { executiveSummaryId },
      ...getBaseExecutiveSummaryQueryArgs()
    });

    if (!executiveSummary) {
      throw new NotFoundException('Executive Summary', executiveSummaryId);
    }
    if (executiveSummary.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Executive Summary');
    }
    if (executiveSummary.dateDeleted) {
      throw new DeletedException('Executive Summary', executiveSummaryId);
    }

    if (teamId) {
      const team = await prisma.team.findUnique({ where: { teamId } });
      if (!team) {
        throw new NotFoundException('Team', teamId);
      }
      if (team.organizationId !== organization.organizationId) {
        throw new InvalidOrganizationException('Team');
      }
    }

    const { carId, seasonStartDate, seasonEndDate } = executiveSummary;

    const projects = await prisma.project.findMany({
      where: {
        carId,
        wbsElement: { organizationId: organization.organizationId, dateDeleted: null },
        ...(teamId ? { teams: { some: { teamId } } } : {})
      },
      ...getVehicleDevelopmentProjectQueryArgs()
    });

    const projectsInSeason = projects.filter((project) => {
      const start = calculateProjectStartDate(project.workPackages);
      const end = calculateProjectEndDate(project.workPackages);
      if (!start || !end) return false;
      if (seasonStartDate && end < seasonStartDate) return false;
      if (seasonEndDate && start > seasonEndDate) return false;
      return true;
    });

    return vehicleDevelopmentSummaryTransformer(executiveSummaryId, projectsInSeason);
  }

  /**
   * Gets the budget by division for an executive summary's season.
   * @param organization the organization the executive summary belongs to
   * @param executiveSummaryId the id of the executive summary
   * @param viewer the user requesting the data
   * @returns the total project budget per division for the executive summary's car and season
   * @throws AccessDeniedException if the viewer is a guest
   * @throws NotFoundException if the executive summary does not exist
   * @throws InvalidOrganizationException if the executive summary belongs to a different organization
   * @throws DeletedException if the executive summary has been deleted
   */
  static async getBudgetSummary(organization: Organization, executiveSummaryId: string, viewer: User) {
    const hasPermission = await userHasPermission(viewer.userId, organization.organizationId, notGuest);
    if (!hasPermission) {
      throw new AccessDeniedException('Only members can view executive summaries');
    }

    const executiveSummary = await prisma.executive_Summary.findUnique({
      where: { executiveSummaryId },
      ...getBaseExecutiveSummaryQueryArgs()
    });

    if (!executiveSummary) {
      throw new NotFoundException('Executive Summary', executiveSummaryId);
    }
    if (executiveSummary.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Executive Summary');
    }
    if (executiveSummary.dateDeleted) {
      throw new DeletedException('Executive Summary', executiveSummaryId);
    }

    const { carId, seasonStartDate, seasonEndDate } = executiveSummary;

    const [divisions, projects] = await Promise.all([
      prisma.team_Type.findMany({ where: { organizationId: organization.organizationId }, orderBy: { name: 'asc' } }),
      prisma.project.findMany({
        where: {
          carId,
          wbsElement: { organizationId: organization.organizationId, dateDeleted: null }
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

    const allBuckets = [...buckets.values()];
    if (unassigned.budget > 0 || unassigned.spent > 0) allBuckets.push(unassigned);

    const budgetByDivision = {
      tipLabel: 'Dollars',
      values: allBuckets.map(({ label, budget }) => ({ label, value: roundToCents(budget) }))
    };

    // strict comparisons so that ties go to the first bucket (divisions are ordered by name)
    let mostExpensiveDivision: BudgetHighlight | undefined;
    let mostOverbudgetDivision: BudgetHighlight | undefined;
    allBuckets.forEach(({ label, budget, spent }) => {
      const roundedSpent = roundToCents(spent);
      const overage = roundToCents(spent - budget);
      if (roundedSpent > (mostExpensiveDivision?.amount ?? 0)) {
        mostExpensiveDivision = { label, amount: roundedSpent };
      }
      if (overage > (mostOverbudgetDivision?.amount ?? 0)) {
        mostOverbudgetDivision = { label, amount: overage };
      }
    });

    const totalBudget = roundToCents(allBuckets.reduce((sum, { budget }) => sum + budget, 0));
    const totalSpent = roundToCents(allBuckets.reduce((sum, { spent }) => sum + spent, 0));

    return {
      executiveSummaryId,
      budgetByDivision,
      totalBudget,
      totalSpent,
      mostExpensiveDivision,
      mostOverbudgetDivision,
      mostOverbudgetProject
    };
  }

  /**
   * Edits an existing competition performance entry.
   * @param submitter the user editing the competition performance
   * @param organization the organization the competition performance belongs to
   * @param finalPlace the updated final place, or null to clear it
   * @param totalPointsEarned the updated total points earned, or null to clear it
   * @param maxPoints the updated max points, or null to clear it
   * @param bestStaticEvent the updated best static event, or null to clear it
   * @param worstStaticEvent the updated worst static event, or null to clear it
   * @param bestDynamicEvent the updated best dynamic event, or null to clear it
   * @param worstDynamicEvent the updated worst dynamic event, or null to clear it
   * @param accelerationTopTimeSeconds the updated acceleration top time, or null to clear it
   * @param autocrossTopTimeSeconds the updated autocross top time, or null to clear it
   * @param enduranceLapsCompleted the updated endurance laps completed, or null to clear it
   * @param maxLaps the updated max laps, or null to clear it
   * @param enduranceAvgLapTimeSeconds the updated endurance average lap time, or null to clear it
   * @param competitionPerformanceId the id of the competition performance being edited
   * @returns the updated competition performance
   * @throws AccessDeniedException if the submitter is not an admin and not on the ops team
   * @throws NotFoundException if the competition performance does not exist
   * @throws InvalidOrganizationException if the competition performance belongs to a different organization
   * @throws DeletedException if the competition performance has been deleted
   */
  static async editCompetitionPerformance(
    submitter: User,
    organization: Organization,
    finalPlace: number | null,
    totalPointsEarned: number | null,
    maxPoints: number | null,
    bestStaticEvent: string | null,
    worstStaticEvent: string | null,
    bestDynamicEvent: string | null,
    worstDynamicEvent: string | null,
    accelerationTopTimeSeconds: number | null,
    autocrossTopTimeSeconds: number | null,
    enduranceLapsCompleted: number | null,
    maxLaps: number | null,
    enduranceAvgLapTimeSeconds: number | null,
    competitionPerformanceId: string
  ) {
    const isAdminUser = await userHasPermission(submitter.userId, organization.organizationId, isAdmin);

    if (!isAdminUser) {
      let isOpsTeamMember = false;
      try {
        isOpsTeamMember = await isUserOnOpsTeam(submitter, organization.organizationId);
      } catch {
        // Ops team may not exist yet
      }
      if (!isOpsTeamMember) throw new AccessDeniedException('edit a competition performance');
    }

    const currentCompetitionPerformance = await prisma.competition_Performance.findUnique({
      where: { competitionPerformanceId },
      include: { executiveSummary: { include: { car: { include: { wbsElement: true } } } } }
    });
    if (!currentCompetitionPerformance) {
      throw new NotFoundException('Competition Performance', competitionPerformanceId);
    }

    if (currentCompetitionPerformance.executiveSummary.car.wbsElement.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Competition Performance');
    }
    const updatedCompetitionPerformance = await prisma.competition_Performance.update({
      where: { competitionPerformanceId },
      data: {
        finalPlace,
        totalPointsEarned,
        maxPoints,
        bestStaticEvent,
        worstStaticEvent,
        bestDynamicEvent,
        worstDynamicEvent,
        accelerationTopTimeSeconds,
        autocrossTopTimeSeconds,
        enduranceLapsCompleted,
        maxLaps,
        enduranceAvgLapTimeSeconds
      },
      ...getBaseCompetitionPerformanceQueryArgs()
    });

    return competitionPerformanceTransformer(updatedCompetitionPerformance);
  }
}
