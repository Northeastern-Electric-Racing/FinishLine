import { Organization } from '@prisma/client';
import { BayDashboardConfig, isHead, User } from 'shared';
import prisma from '../prisma/prisma.js';
import { getBayDashboardConfigQueryArgs } from '../prisma-query-args/bay-dashboard.query-args.js';
import { bayDashboardConfigTransformer } from '../transformers/bay-dashboard.transformer.js';
import { AccessDeniedException } from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';

export default class BayDashboardAdminService {
  /**
   * Gets the bay dashboard config currently displayed on the TV for an organization,
   * which is the most recently created non-deleted config.
   * @param user the user requesting the config
   * @param organization the organization the config belongs to
   * @returns the current config, or null if the organization has never saved one
   */
  static async getCurrentBayDashboardConfig(user: User, organization: Organization): Promise<BayDashboardConfig | null> {
    if (!(await userHasPermission(user.userId, organization.organizationId, isHead)))
      throw new AccessDeniedException('Only heads and above can view the bay dashboard config');

    const config = await prisma.bay_Dashboard_Config.findFirst({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      orderBy: { dateCreated: 'desc' },
      ...getBayDashboardConfigQueryArgs()
    });

    return config ? bayDashboardConfigTransformer(config) : null;
  }
}
