import { BayDashboardOrganization } from 'shared';
import prisma from '../prisma/prisma.js';
import { NotFoundException } from '../utils/errors.utils.js';

export default class BayDashboardService {
  /**
   * Gets the organization the public bay dashboard belongs to.
   */
  static async getBayDashboardOrganization(): Promise<BayDashboardOrganization> {
    const organization = await prisma.organization.findFirst({
      where: { dateDeleted: null },
      orderBy: { dateCreated: 'asc' },
      select: { organizationId: true, name: true }
    });

    if (!organization) throw new NotFoundException('Organization', 'public');

    return organization;
  }
}
