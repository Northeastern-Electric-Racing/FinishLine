import { isHead } from 'shared';
import { User, Organization, Sponsor_Task } from '@prisma/client';
import { userHasPermission } from '../utils/users.utils';
import { AccessDeniedAdminOnlyException, NotFoundException } from '../utils/errors.utils';
import prisma from '../prisma/prisma';
import sponsorTaskTransformer from '../transformers/sponsor-task.transformer';
import { getSponsorQueryArgs } from '../prisma-query-args/sponsor.query.args';

export default class FinanceServices {
  /**
   * Creates a new sponsor for the given organization and assigns associated tasks.
   *
   * @param submitter The user submitting the request, who must have appropriate permissions to create a sponsor.
   * @param name The name of the sponsor.
   * @param activeStatus The status indicating whether the sponsor is active or not.
   * @param sponsorValue The financial value associated with the sponsor.
   * @param joinDate The date when the sponsor joins.
   * @param activeYears An array of years indicating the sponsor's active period.
   * @param sponsorTierId The ID of the sponsor's tier.
   * @param taxExempt Boolean indicating if the sponsor is tax-exempt.
   * @param discountCode The discount code associated with the sponsor.
   * @param vendorContact The contact information for the sponsor's vendor.
   * @param sponsorTasks An array of sponsor tasks associated with the sponsor.
   * @param organization The organization for which the sponsor is being created.
   *
   * @returns The created sponsor object, including associated tasks.
   *
   * @throws AccessDeniedAdminOnlyException If the submitter does not have permission to create a sponsor.
   */
  static async createSponsor(
    submitter: User,
    name: string,
    activeStatus: boolean,
    sponsorValue: number,
    joinDate: Date,
    activeYears: number[],
    sponsorTierId: string,
    taxExempt: boolean,
    vendorContact: string,
    sponsorTasks: Sponsor_Task[],
    organization: Organization,
    discountCode?: string
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead)))
      throw new AccessDeniedAdminOnlyException('create a sponsor');

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        activeStatus,
        sponsorValue,
        joinDate,
        activeYears,
        sponsorTierId,
        taxExempt,
        discountCode,
        vendorContact,
        sponsorTasks: {
          create: sponsorTasks.map((task) => ({
            dueDate: task.dueDate,
            notifyDate: task.notifyDate,
            assigneeUserId: task.assigneeUserId,
            notes: task.notes
          }))
        },
        organizationId: organization.organizationId
      },
      include: {
        sponsorTasks: true
      }
    });

    return sponsor;
  }

  /**
   * Gets the sponsor tasks for the given sponsor Id
   * @param sponsorId the id of the sponsor these tasks are tied to
   * @param organizationId the organization the user is in
   * @returns all the sponsor tasks for the sponsor
   */
  static async getSponsorTasks(sponsorId: string, organizationId: string) {
    const sponsor = await prisma.sponsor.findUnique({
      where: { dateDeleted: null, sponsorId },
      ...getSponsorQueryArgs(organizationId)
    });

    if (!sponsor) {
      throw new NotFoundException('Sponsor', sponsorId);
    }

    return sponsor.sponsorTasks.map(sponsorTaskTransformer);
  }
}
