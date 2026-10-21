import { Bay_Dashboard_Widget_Type, Organization } from '@prisma/client';
import { AvailableBayDashboardWidgets, BayDashboardConfig } from 'shared';
import prisma from '../prisma/prisma.js';
import { getBayDashboardConfigQueryArgs } from '../prisma-query-args/bay-dashboard.query-args.js';
import {
  bayDashboardConfigTransformer,
  bayDashboardWidgetSizeTransformer,
  bayDashboardWidgetTypeTransformer
} from '../transformers/bay-dashboard.transformer.js';
import { widgetDetails } from '../utils/bay-dashboard.utils.js';
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

  /**
   * Lists the widget types that can be placed on a bay dashboard and the sizes each supports.
   * @param slug the organization slug from the /bay-dashboard/:slug URL
   * @returns the available widgets
   */
  static async getAvailableWidgets(slug: string): Promise<AvailableBayDashboardWidgets> {
    await BayDashboardService.getOrganizationBySlug(slug);

    return {
      widgets: Object.values(Bay_Dashboard_Widget_Type)
        .filter((type) => widgetDetails[type].sizes.length > 0)
        .map((type) => ({
          type: bayDashboardWidgetTypeTransformer(type),
          displayName: widgetDetails[type].displayName,
          sizes: widgetDetails[type].sizes.map(bayDashboardWidgetSizeTransformer)
        }))
    };
  }
}
