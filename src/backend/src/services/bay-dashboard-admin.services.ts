import { Organization } from '@prisma/client';
import { BayDashboardConfig, BayDashboardSlotCreateArgs, BayDashboardWidgetSize, isHead, User } from 'shared';
import prisma from '../prisma/prisma.js';
import { getBayDashboardConfigQueryArgs } from '../prisma-query-args/bay-dashboard.query-args.js';
import { bayDashboardConfigTransformer } from '../transformers/bay-dashboard.transformer.js';
import { AccessDeniedException, HttpException } from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';

// the slots the TV can render, keyed by position (0 = left large, 1 = right medium, 2 = right small).
const DEFAULT_LAYOUT: Record<number, BayDashboardWidgetSize> = {
  0: BayDashboardWidgetSize.LARGE,
  1: BayDashboardWidgetSize.MEDIUM,
  2: BayDashboardWidgetSize.SMALL
};

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
    slots: BayDashboardSlotCreateArgs[]
  ): Promise<BayDashboardConfig> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads and above can save the bay dashboard config');
    }

    // every slot must be a position the TV renders, at the size that position is laid out for
    for (const slot of slots) {
      const expectedSize = DEFAULT_LAYOUT[slot.position];
      if (!expectedSize) {
        throw new HttpException(400, `Slot position ${slot.position} is not part of the bay dashboard layout`);
      }
      if (slot.size !== expectedSize) {
        throw new HttpException(400, `Slot position ${slot.position} must be size ${expectedSize}`);
      }
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
