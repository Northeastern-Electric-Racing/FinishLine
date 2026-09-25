import { Organization } from '@prisma/client';
import { notGuest, User } from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedException,
  DeletedException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import { getExecutiveSummaryQueryArgs } from '../prisma-query-args/executive-summary.query-args.js';
import { executiveSummaryTransformer } from '../transformers/executive-summary.transformer.js';
import { userHasPermission } from '../utils/users.utils.js';

export default class ExecSummaryServices {
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
}
