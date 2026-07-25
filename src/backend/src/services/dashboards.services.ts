import { Dashboard, User } from 'shared';
import { Organization } from '@prisma/client';
import { getDashboardQueryArgs } from '../prisma-query-args/dashboards.query-args.js';
import {
  AccessDeniedException,
  DeletedException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import prisma from '../prisma/prisma.js';
import dashboardTransformer from '../transformers/dashboards.transformer.js';

export default class DashboardService {
  /**
   * Creates a new dashboard (saved filter configuration) for the current user.
   * @param submitter the user creating the dashboard
   * @param organization the organization the dashboard belongs to
   * @param name the display name of the dashboard
   * @param link the relative path (pathname + query string) the dashboard restores
   * @returns the created dashboard
   */
  static async createDashboard(submitter: User, organization: Organization, name: string, link: string): Promise<Dashboard> {
    const dashboard = await prisma.dashboard.create({
      data: {
        name,
        link,
        userId: submitter.userId,
        organizationId: organization.organizationId
      },
      ...getDashboardQueryArgs(organization.organizationId)
    });

    return dashboardTransformer(dashboard);
  }

  /**
   * Returns all of the current user's non-deleted dashboards for the organization.
   * @param submitter the user whose dashboards to fetch
   * @param organization the organization to scope to
   * @returns the user's dashboards
   */
  static async getUserDashboards(submitter: User, organization: Organization): Promise<Dashboard[]> {
    const dashboards = await prisma.dashboard.findMany({
      where: {
        organizationId: organization.organizationId,
        userId: submitter.userId,
        dateDeleted: null
      },
      ...getDashboardQueryArgs(organization.organizationId)
    });

    return dashboards.map(dashboardTransformer);
  }

  /**
   * Overwrites the saved link (filters) of an existing dashboard the current user owns.
   * @param submitter the user editing the dashboard
   * @param organization the organization the dashboard belongs to
   * @param dashboardId the id of the dashboard to edit
   * @param link the new relative path to save
   * @returns the updated dashboard
   */
  static async editDashboard(
    submitter: User,
    organization: Organization,
    dashboardId: string,
    link: string
  ): Promise<Dashboard> {
    const dashboard = await prisma.dashboard.findUnique({ where: { dashboardId } });

    if (!dashboard) throw new NotFoundException('Dashboard', dashboardId);
    if (dashboard.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Dashboard');
    if (dashboard.dateDeleted) throw new DeletedException('Dashboard', dashboardId);
    if (dashboard.userId !== submitter.userId) {
      throw new AccessDeniedException('Only the owner can edit this dashboard');
    }

    const updatedDashboard = await prisma.dashboard.update({
      where: { dashboardId },
      data: { link },
      ...getDashboardQueryArgs(organization.organizationId)
    });

    return dashboardTransformer(updatedDashboard);
  }

  /**
   * Soft-deletes a dashboard the current user owns.
   * @param deleter the user deleting the dashboard
   * @param organization the organization the dashboard belongs to
   * @param dashboardId the id of the dashboard to delete
   * @returns the deleted dashboard
   */
  static async deleteDashboard(deleter: User, organization: Organization, dashboardId: string): Promise<Dashboard> {
    const dashboard = await prisma.dashboard.findUnique({ where: { dashboardId } });

    if (!dashboard) throw new NotFoundException('Dashboard', dashboardId);
    if (dashboard.organizationId !== organization.organizationId) throw new InvalidOrganizationException('Dashboard');
    if (dashboard.dateDeleted) throw new DeletedException('Dashboard', dashboardId);
    if (dashboard.userId !== deleter.userId) {
      throw new AccessDeniedException('Only the owner can delete this dashboard');
    }

    const deletedDashboard = await prisma.dashboard.update({
      where: { dashboardId },
      data: { dateDeleted: new Date() },
      ...getDashboardQueryArgs(organization.organizationId)
    });

    return dashboardTransformer(deletedDashboard);
  }
}
