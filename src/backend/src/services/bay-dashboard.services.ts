import { Organization } from '@prisma/client';
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
}
