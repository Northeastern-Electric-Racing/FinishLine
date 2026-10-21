import { Organization } from '@prisma/client';
import {
  BayDashboardConfig,
  BayDashboardCountdown,
  BayDashboardSlotCreateArgs,
  BayDashboardWidgetSize,
  BayDashboardWidgetType,
  isHead,
  User
} from 'shared';
import prisma from '../prisma/prisma.js';
import {
  getBayDashboardConfigQueryArgs,
  getBayDashboardCountdownQueryArgs
} from '../prisma-query-args/bay-dashboard.query-args.js';
import {
  bayDashboardConfigTransformer,
  bayDashboardCountdownTransformer
} from '../transformers/bay-dashboard.transformer.js';
import { widgetDetails } from '../utils/bay-dashboard.utils.js';
import {
  AccessDeniedException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';

// the slots the TV can render, keyed by position (0 = left large, 1 = right medium, 2 = right small).
const SLOT_SIZE_BY_POSITION: Record<number, BayDashboardWidgetSize> = {
  0: BayDashboardWidgetSize.LARGE,
  1: BayDashboardWidgetSize.MEDIUM,
  2: BayDashboardWidgetSize.SMALL
};

// the widgets the TV shows when nothing has been chosen, keyed by position
const DEFAULT_WIDGET_TYPE_BY_POSITION: Record<number, BayDashboardWidgetType> = {
  0: BayDashboardWidgetType.CALENDAR,
  1: BayDashboardWidgetType.OVERDUE_WORK_PACKAGES,
  2: BayDashboardWidgetType.TEXT_FIELD
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
   * @param slots the slots to display, each with at most one widget. Any position left out, or without a widget, is saved with its default widgets
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
      const expectedSize = SLOT_SIZE_BY_POSITION[slot.position];
      if (!expectedSize) {
        throw new HttpException(400, `Slot position ${slot.position} is not part of the bay dashboard layout`);
      }
      if (slot.size !== expectedSize) {
        throw new HttpException(400, `Slot position ${slot.position} must be size ${expectedSize}`);
      }

      if (slot.widget) {
        if (!Object.values(BayDashboardWidgetType).includes(slot.widget.type)) {
          throw new HttpException(400, `Slot position ${slot.position}: ${slot.widget.type} is not a valid widget type`);
        }

        if (!widgetDetails[slot.widget.type].sizes.includes(slot.size)) {
          throw new HttpException(400, `Slot position ${slot.position}: ${slot.widget.type} widgets can't be ${slot.size}`);
        }

        // only text field widgets carry text
        const hasText = !!slot.widget.text?.trim();
        if (slot.widget.type === BayDashboardWidgetType.TEXT_FIELD && !hasText) {
          throw new HttpException(400, `Slot position ${slot.position}: text field widgets must have text`);
        }
        if (slot.widget.type !== BayDashboardWidgetType.TEXT_FIELD && slot.widget.text) {
          throw new HttpException(400, `Slot position ${slot.position}: only text field widgets can have text`);
        }
      }
    }

    // a config can only hold one slot per position
    const positions = slots.map((slot) => slot.position);
    if (new Set(positions).size !== positions.length) {
      throw new HttpException(400, 'Each slot must have a unique position');
    }

    // every position in the layout is always saved, so positions without a widget get the position's default
    const slotsToCreate = Object.keys(SLOT_SIZE_BY_POSITION).map((key) => {
      const position = Number(key);
      const submitted = slots.find((slot) => slot.position === position);
      return {
        position,
        size: SLOT_SIZE_BY_POSITION[position],
        widget: submitted?.widget ?? { type: DEFAULT_WIDGET_TYPE_BY_POSITION[position], text: undefined }
      };
    });

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
            create: slotsToCreate.map((slot) => ({
              position: slot.position,
              size: slot.size,
              widgets: { create: [{ type: slot.widget.type, order: 0, text: slot.widget.text }] }
            }))
          }
        },
        ...getBayDashboardConfigQueryArgs()
      });
    });

    return bayDashboardConfigTransformer(config);
  }

  /**
   * Creates a countdown to display on the bay dashboard.
   * @param submitter the user creating the countdown, must be a head or above
   * @param organization the organization the countdown belongs to
   * @param name the name of the countdown
   * @param startDate the date the countdown starts from
   * @param endDate the date the countdown ends, if it has one
   * @returns the created countdown
   */
  static async createBayDashboardCountdown(
    submitter: User,
    organization: Organization,
    name: string,
    startDate: Date,
    endDate?: Date
  ): Promise<BayDashboardCountdown> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads and above can create bay dashboard countdowns');
    }

    if (endDate && endDate <= startDate) {
      throw new HttpException(400, 'End date must be after start date');
    }

    const countdown = await prisma.bay_Dashboard_Countdown.create({
      data: {
        name,
        startDate,
        endDate,
        organizationId: organization.organizationId,
        userCreatedId: submitter.userId
      },
      ...getBayDashboardCountdownQueryArgs()
    });

    return bayDashboardCountdownTransformer(countdown);
  }

  /**
   * Soft deletes a bay dashboard countdown
   * @param user the user deleting the countdown, required to be a head or above
   * @param countdownId takes the id for the countdown being deleted
   * @param organization takes the organization it belongs to
   * @returns the deleted countdown
   */
  static async deleteBayDashboardCountdown(
    user: User,
    countdownId: string,
    organization: Organization
  ): Promise<BayDashboardCountdown> {
    if (!(await userHasPermission(user.userId, organization.organizationId, isHead))) {
      throw new AccessDeniedException('Only heads and above are allowed to delete bay dashboard countdowns');
    }
    const countdown = await prisma.bay_Dashboard_Countdown.findUnique({
      where: { bayDashboardCountdownId: countdownId }
    });
    if (!countdown) {
      throw new NotFoundException('Bay Dashboard Countdown', countdownId);
    }
    if (countdown.organizationId !== organization.organizationId) {
      throw new InvalidOrganizationException('Bay Dashboard Countdown');
    }
    if (countdown.dateDeleted) {
      throw new DeletedException('Bay Dashboard Countdown', countdownId);
    }

    const deletedCountdown = await prisma.bay_Dashboard_Countdown.update({
      where: { bayDashboardCountdownId: countdownId },
      data: { dateDeleted: new Date(), userDeletedId: user.userId },
      ...getBayDashboardCountdownQueryArgs()
    });

    return bayDashboardCountdownTransformer(deletedCountdown);
  }
}
