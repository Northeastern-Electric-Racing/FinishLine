import { Organization } from '@prisma/client';
import { BayDashboardOrganization } from 'shared';
import prisma from '../prisma/prisma.js';
import { DeletedException, NotFoundException } from '../utils/errors.utils.js';

export default class BayDashboardService {
  /**
   * Finds the organization a public bay dashboard URL refers to.
   * @param slug the organization slug from the /bay-dashboard/:slug URL
   * @returns the organization with that slug
   */
  static async getOrganizationBySlug(slug: string): Promise<Organization> {
    const organization = await prisma.organization.findUnique({ where: { slug } });

    if (!organization) throw new NotFoundException('Organization', slug);
    if (organization.dateDeleted) throw new DeletedException('Organization', slug);

    return organization;
  }

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
