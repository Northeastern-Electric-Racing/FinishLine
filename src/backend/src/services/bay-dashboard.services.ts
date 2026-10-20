import { Bay_Dashboard_Widget_Type, Organization } from '@prisma/client';
import { AvailableBayDashboardWidgets } from 'shared';
import prisma from '../prisma/prisma.js';
import {
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
