import { Organization } from '@prisma/client';
import { BayDashboardConfig, BayDashboardSlotInput, isHead, User } from 'shared';
import prisma from '../prisma/prisma.js';
import { getBayDashboardConfigQueryArgs } from '../prisma-query-args/bay-dashboard.query-args.js';
import bayDashboardConfigTransformer from '../transformers/bay-dashboard.transformer.js';
import { AccessDeniedException, HttpException } from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';

export default class BayDashboardAdminService {
  /**
   * Saves a new bay dashboard config, replacing what the TV is currently displaying for this organization.
   * The previous config is soft deleted rather than overwritten, so the admin GET route always has exactly one
   * active config to return and earlier configs stay around as history.
   * @param submitter the user saving the config, must be a head or above
   * @param organization the organization whose bay dashboard is being configured
   * @param slots the slots to display, each with at most one widget
   * @returns the newly created config with its slots and widgets
   */
  static async saveBayDashboardConfig(
    submitter: User,
    organization: Organization,
    slots: BayDashboardSlotInput[]
  ): Promise<BayDashboardConfig> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads and above can save the bay dashboard config');
    }

    // a config can only hold one slot per position
    const positions = slots.map((slot) => slot.position);
    if (new Set(positions).size !== positions.length) {
      throw new HttpException(400, 'Each slot must have a unique position');
    }

    // soft delete existing bay dash config and create a new one with the provided slots and widgets
    const config = await prisma.$transaction(async (tx) => {
      await tx.bay_Dashboard_Config.updateMany({
        where: { organizationId: organization.organizationId, dateDeleted: null },
        data: { dateDeleted: new Date() }
      });

      return await tx.bay_Dashboard_Config.create({
        data: {
          organizationId: organization.organizationId,
          userCreatedId: submitter.userId,
          slots: {
            create: slots.map((slot) => ({
              position: slot.position,
              size: slot.size,
              rotationSeconds: slot.rotationSeconds,
              widgets: slot.widget ? { create: { type: slot.widget.type, order: 0, text: slot.widget.text } } : undefined
            }))
          }
        },
        ...getBayDashboardConfigQueryArgs()
      });
    });

    return bayDashboardConfigTransformer(config);
  }
}
