/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Measure, Organization } from '@prisma/client';
import { calculateProjectEndDate, calculateProjectStartDate, isAdmin, notGuest, User } from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';
import { getGraphDataForProjectBudgetByDivision } from '../utils/statistics.utils.js';
import { isUserOnOpsTeam } from '../utils/exec-summaries.utils.js';
import {
  getExecutiveSummaryQueryArgs,
  getVehicleDevelopmentProjectQueryArgs
} from '../prisma-query-args/executive-summary.query-args.js';
import {
  executiveSummaryTransformer,
  vehicleDevelopmentSummaryTransformer
} from '../transformers/executive-summary.transformer.js';

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
      ...getExecutiveSummaryQueryArgs(organization.organizationId)
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
      ...getExecutiveSummaryQueryArgs(organization.organizationId)
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
      ...getExecutiveSummaryQueryArgs(organization.organizationId)
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
      ...getExecutiveSummaryQueryArgs(organization.organizationId)
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
      ...getExecutiveSummaryQueryArgs(organization.organizationId)
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
      ...getExecutiveSummaryQueryArgs(organization.organizationId)
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

    const budgetByDivision = await getGraphDataForProjectBudgetByDivision(
      Measure.SUM,
      organization.organizationId,
      executiveSummary.seasonStartDate,
      executiveSummary.seasonEndDate,
      { carIds: [executiveSummary.carId] }
    );

    return { executiveSummaryId, budgetByDivision };
  }
}
