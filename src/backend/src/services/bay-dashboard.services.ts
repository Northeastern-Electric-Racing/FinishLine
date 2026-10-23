import { Organization } from '@prisma/client';
import { PublicBayDashboardConfig } from 'shared';
import prisma from '../prisma/prisma.js';
import { getPublicBayDashboardConfigQueryArgs } from '../prisma-query-args/bay-dashboard.query-args.js';
import { publicBayDashboardConfigTransformer } from '../transformers/bay-dashboard.transformer.js';
import { DeletedException, NotFoundException } from '../utils/errors.utils.js';

export default class BayDashboardService {
  /**
   * Finds the organization a public bay dashboard URL refers to.
   * @param slug the organization slug from the /bay-dashboard/:slug URL
   * @returns the id of the organization with that slug
   */
  static async getOrganizationBySlug(slug: string): Promise<Pick<Organization, 'organizationId' | 'dateDeleted'>> {
    const organization = await prisma.organization.findUnique({
      where: { slug },
      select: { organizationId: true, dateDeleted: true }
    });

    if (!organization) throw new NotFoundException('Organization', slug);
    if (organization.dateDeleted) throw new DeletedException('Organization', slug);

    return organization;
  }

  /**
   * Gets the config the TV in the bay should be displaying.
   * Public, so the TV can load it without logging in.
   * @param slug the organization slug from the /bay-dashboard/:slug URL
   * @returns the slots to render, or null if the organization has never saved a config
   */
  static async getBayDashboardConfig(slug: string): Promise<PublicBayDashboardConfig | null> {
    const organization = await BayDashboardService.getOrganizationBySlug(slug);

    const config = await prisma.bay_Dashboard_Config.findFirst({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      orderBy: { dateCreated: 'desc' },
      ...getPublicBayDashboardConfigQueryArgs()
    });

    return config ? publicBayDashboardConfigTransformer(config) : null;
  }
}
