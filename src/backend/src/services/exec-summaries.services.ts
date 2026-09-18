import { Organization } from '@prisma/client';
import prisma from '../prisma/prisma.js';
import { NotFoundException } from '../utils/errors.utils.js';
import { getExecutiveSummaryQueryArgs } from '../prisma-query-args/executive-summary.query-args.js';
import { executiveSummaryTransformer } from '../transformers/executive-summary.transformer.js';

export default class ExecSummaryServices {
  static async getSingleExecutiveSummary(organization: Organization, executiveSummaryId: string) {
    const executiveSummary = await prisma.executive_Summary.findUnique({
      where: { executiveSummaryId },
      ...getExecutiveSummaryQueryArgs(organization.organizationId)
    });

    if (!executiveSummary) {
      throw new NotFoundException('Executive Summary', executiveSummaryId);
    }

    return executiveSummaryTransformer(executiveSummary);
  }
}
