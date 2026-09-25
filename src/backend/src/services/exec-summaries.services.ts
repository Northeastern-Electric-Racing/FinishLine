/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Organization } from '@prisma/client';
import { isAdmin, notGuest, User } from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedException,
  DeletedException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';
import { isUserOnOpsTeam } from '../utils/exec-summaries.utils.js';
import { getExecutiveSummaryQueryArgs } from '../prisma-query-args/executive-summary.query-args.js';
import { executiveSummaryTransformer } from '../transformers/executive-summary.transformer.js';

export default class ExecSummaryServices {
  /**
   * Edits an existing executive summary.
   * @param submitter the user editing the executive summary
   * @param organization the organization the executive summary belongs to
   * @param goals the updated goals
   * @param winsAndImprovements the updated wins and improvements
   * @param budgetNotes the updated budget notes
   * @param recruitmentNotes the updated recruitment notes
   * @param seasonStartDate the updated season start date
   * @param seasonEndDate the updated season end date
   * @param executiveSummaryId the id of the executive summary being edited
   * @returns the updated executive summary
   * @throws AccessDeniedException if the submitter is not an admin and not on the ops team
   * @throws NotFoundException if the executive summary does not exist
   * @throws InvalidOrganizationException if the executive summary belongs to a different organization
   * @throws DeletedException if the executive summary has been deleted
   */
  static async editExecutiveSummary(
    submitter: User,
    organization: Organization,
    goals: string,
    winsAndImprovements: string,
    budgetNotes: string,
    recruitmentNotes: string,
    seasonStartDate: Date,
    seasonEndDate: Date,
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
}
