import { Organization } from '@prisma/client';
import { BayDashboardConfig } from 'shared';
import prisma from '../prisma/prisma.js';
import { getBayDashboardConfigQueryArgs } from '../prisma-query-args/bay-dashboard.query-args.js';
import { bayDashboardConfigTransformer } from '../transformers/bay-dashboard.transformer.js';
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
   * Gets the config the TV in the bay should be displaying. 
   * Public, so the TV can load it without logging in.
   * @param slug the organization slug from the /bay-dashboard/:slug URL
   * @returns the current config, or null if the organization has never saved one
   */
  static async getBayDashboardConfig(slug: string): Promise<BayDashboardConfig | null> {
    const organization = await BayDashboardService.getOrganizationBySlug(slug);

    const config = await prisma.bay_Dashboard_Config.findFirst({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      orderBy: { dateCreated: 'desc' },
      ...getBayDashboardConfigQueryArgs()
    });

    return config ? bayDashboardConfigTransformer(config) : null;
  }
}
