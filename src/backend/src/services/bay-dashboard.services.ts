import { Bay_Dashboard_Widget_Size, Bay_Dashboard_Widget_Type, Organization } from '@prisma/client';
import { AvailableBayDashboardWidgets } from 'shared';
import prisma from '../prisma/prisma.js';
import {
  bayDashboardWidgetSizeTransformer,
  bayDashboardWidgetTypeTransformer
} from '../transformers/bay-dashboard.transformer.js';
import { DeletedException, NotFoundException } from '../utils/errors.utils.js';

const availableWidgets = [
  {
    type: Bay_Dashboard_Widget_Type.CALENDAR,
    displayName: 'Calendar',
    sizes: [Bay_Dashboard_Widget_Size.LARGE, Bay_Dashboard_Widget_Size.MEDIUM]
  },
  {
    type: Bay_Dashboard_Widget_Type.OVERDUE_WORK_PACKAGES,
    displayName: 'Overdue Work Packages',
    sizes: [Bay_Dashboard_Widget_Size.LARGE, Bay_Dashboard_Widget_Size.MEDIUM, Bay_Dashboard_Widget_Size.SMALL]
  },
  {
    type: Bay_Dashboard_Widget_Type.TEXT_FIELD,
    displayName: 'Text Field',
    sizes: [Bay_Dashboard_Widget_Size.LARGE, Bay_Dashboard_Widget_Size.MEDIUM, Bay_Dashboard_Widget_Size.SMALL]
  }
];

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
      widgets: availableWidgets.map((widget) => ({
        type: bayDashboardWidgetTypeTransformer(widget.type),
        displayName: widget.displayName,
        sizes: widget.sizes.map(bayDashboardWidgetSizeTransformer)
      }))
    };
  }
}
