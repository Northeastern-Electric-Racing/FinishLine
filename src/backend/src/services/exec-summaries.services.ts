import { Organization } from '@prisma/client';
import { isAdmin, notGuest, User } from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  HttpException,
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

  /**
   * Creates an executive summary for a car
   * @param creator the user creating the executive summary
   * @param organization the org the executive summary is being created in
   * @param carId the car the executive summary summarizes
   * @param seasonStartDate the date the season started
   * @param seasonEndDate the date the season ended
   * @param goals the goals set for the season
   * @param winsAndImprovements the wins and improvements from the season
   * @param budgetNotes notes about the season's budget
   * @param recruitmentNotes notes about the season's recruitment
   * @returns the created executive summary
   * @throws if the creator is not an admin, the car doesn't exist in the organization,
   *         the car already has an executive summary, or the season dates are out of order
   */
  static async createExecutiveSummary(
    creator: User,
    organization: Organization,
    carId: string,
    seasonStartDate?: Date,
    seasonEndDate?: Date,
    goals?: string,
    winsAndImprovements?: string,
    budgetNotes?: string,
    recruitmentNotes?: string
  ) {
    if (!(await userHasPermission(creator.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create an executive summary');

    const car = await prisma.car.findFirst({
      where: { carId, wbsElement: { organizationId: organization.organizationId } }
    });

    if (!car) throw new NotFoundException('Car', carId);

    // a car can only ever have one executive summary, and the constraint holds even once one is
    // soft deleted, so a deleted summary still blocks creating a replacement
    const existingSummary = await prisma.executive_Summary.findUnique({ where: { carId } });

    if (existingSummary) {
      throw new HttpException(
        400,
        existingSummary.dateDeleted
          ? `This car already has a deleted executive summary, so a new one cannot be created`
          : `This car already has an executive summary`
      );
    }

    if (seasonStartDate && seasonEndDate && seasonStartDate > seasonEndDate)
      throw new HttpException(400, 'Season start date must not be after season end date');

    const executiveSummary = await prisma.executive_Summary.create({
      data: {
        carId,
        seasonStartDate,
        seasonEndDate,
        goals,
        winsAndImprovements,
        budgetNotes,
        recruitmentNotes,
        userCreatedId: creator.userId
      },
      ...getExecutiveSummaryQueryArgs(organization.organizationId)
    });

    return executiveSummaryTransformer(executiveSummary);
  }
}
