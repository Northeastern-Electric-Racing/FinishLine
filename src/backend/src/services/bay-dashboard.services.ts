import { Event_Status, Organization } from '@prisma/client';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone.js';
import utc from 'dayjs/plugin/utc.js';
import {
  BAY_DASHBOARD_CALENDAR_DAYS_AHEAD,
  BayDashboardCountdown,
  EASTERN_TIMEZONE,
  PublicBayDashboardCalendarEvent,
  PublicBayDashboardConfig
} from 'shared';
import prisma from '../prisma/prisma.js';
import {
  getBayDashboardCalendarEventQueryArgs,
  getBayDashboardCountdownQueryArgs,
  getPublicBayDashboardConfigQueryArgs
} from '../prisma-query-args/bay-dashboard.query-args.js';
import {
  bayDashboardCountdownTransformer,
  publicBayDashboardCalendarEventsTransformer,
  publicBayDashboardConfigTransformer
} from '../transformers/bay-dashboard.transformer.js';
import { DeletedException, NotFoundException } from '../utils/errors.utils.js';

dayjs.extend(utc);
dayjs.extend(timezone);

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

  /**
   * Gets the organization's bay dashboard countdowns.
   * Public, so the TV's countdown widgets can load them without logging in.
   * @param slug the organization slug from the /bay-dashboard/:slug URL
   * @returns the organization's non-deleted countdowns
   */
  static async getBayDashboardCountdowns(slug: string): Promise<BayDashboardCountdown[]> {
    const organization = await BayDashboardService.getOrganizationBySlug(slug);

    const countdowns = await prisma.bay_Dashboard_Countdown.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      ...getBayDashboardCountdownQueryArgs()
    });

    return countdowns.map(bayDashboardCountdownTransformer);
  }

  /**
   * Gets the scheduled events the TV's calendar widget shows.
   * A multi-day event comes back once, with the full range of its schedule slot, and the TV splits it across its days.
   * @param slug the organization slug from the /bay-dashboard/:slug URL
   * @returns the organization's scheduled events happening from the start of today to a few days ahead, ordered by start time
   */
  static async getBayDashboardCalendarEvents(slug: string): Promise<PublicBayDashboardCalendarEvent[]> {
    const organization = await BayDashboardService.getOrganizationBySlug(slug);

    const todayEastern = dayjs().tz(EASTERN_TIMEZONE).startOf('day');
    const windowStart = todayEastern.toDate();
    // the window ends at the end of the last day shown, which is the day DAYS_AHEAD after today
    const windowEnd = todayEastern.add(BAY_DASHBOARD_CALENDAR_DAYS_AHEAD + 1, 'day').toDate();

    const overlapsWindow = { startTime: { lte: windowEnd }, endTime: { gte: windowStart } };

    const events = await prisma.event.findMany({
      where: {
        dateDeleted: null,
        status: Event_Status.SCHEDULED,
        eventType: { organizationId: organization.organizationId, calendars: { some: { dateDeleted: null } } },
        scheduledTimes: { some: overlapsWindow }
      },
      ...getBayDashboardCalendarEventQueryArgs(overlapsWindow)
    });

    return events
      .flatMap(publicBayDashboardCalendarEventsTransformer)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
}
