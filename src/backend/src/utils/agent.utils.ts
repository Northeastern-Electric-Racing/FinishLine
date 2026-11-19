import { Organization } from '@prisma/client';
import { validateWBS, WbsNumber } from 'shared';
import prisma from '../prisma/prisma.js';
import { HttpException } from './errors.utils.js';

/**
 * Helpers for the agent facing APIs: the MCP tools and the /agent routes. Both call the same services
 * the app does; these cover the few things an agent needs on top of them. An agent has no car
 * selector, sends free text where the app sends known good values, and should not be handed a
 * response large enough to swamp its context.
 */

/** How many items one page of an agent facing list holds. */
export const AGENT_PAGE_SIZE = 100;

/** The widest event range the agent APIs serve, to keep responses small enough for an LLM. */
export const MAX_EVENT_RANGE_DAYS = 7;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/** One page of a list, with what the caller needs to fetch the next. */
export interface AgentPage<T> {
  items: T[];
  /** how many items exist across every page */
  total: number;
  /** the offset to ask for next, absent on the last page */
  nextOffset?: number;
}

/**
 * Slices one page out of a full list. The services return lists whole, so paging happens here
 * rather than in the query. That trades a larger database read for reusing the service as is.
 * @param items the full list, in a stable order
 * @param offset how many items to skip
 * @returns the page, the total, and the next offset if more remain
 */
export const paginate = <T>(items: T[], offset: number = 0): AgentPage<T> => {
  const page = items.slice(offset, offset + AGENT_PAGE_SIZE);
  const nextOffset = offset + page.length < items.length ? offset + page.length : undefined;

  return { items: page, total: items.length, nextOffset };
};

/**
 * Resolves a car number to the car it names, defaulting to the newest car. The app sends the selected
 * car's id in a header, but an agent has no selector and knows cars only by number. There is no
 * "current car" flag in the data; the convention across the app is that the highest number is newest.
 * @param organization the organization the request is scoped to
 * @param carNumber the car number, or undefined for the newest car
 * @returns the car's id and its number
 * @throws if the number is malformed, no such car exists, or the organization has no cars
 */
export const resolveCar = async (
  organization: Organization,
  carNumber?: number
): Promise<{ carId: string; carNumber: number }> => {
  if (carNumber !== undefined && (!Number.isInteger(carNumber) || carNumber < 0)) {
    throw new HttpException(400, `"${carNumber}" is not a valid car number`);
  }

  const car = await prisma.car.findFirst({
    where: {
      wbsElement: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        ...(carNumber !== undefined && { carNumber })
      }
    },
    orderBy: { wbsElement: { carNumber: 'desc' } },
    select: { carId: true, wbsElement: { select: { carNumber: true } } }
  });

  if (!car) {
    throw new HttpException(
      404,
      carNumber === undefined ? 'This organization has no cars' : `This organization has no car ${carNumber}`
    );
  }

  return { carId: car.carId, carNumber: car.wbsElement.carNumber };
};

/**
 * Parses a WBS number an agent sent and asserts it names a project. The services check this too, but
 * their errors are written for the app; these say what was wrong in a way a model can correct.
 * @param wbsNum the raw wbs number, such as "1.2.0"
 * @returns the parsed wbs number
 * @throws if it is malformed, or names a work package or a car rather than a project
 */
export const parseProjectWbsNum = (wbsNum: string): WbsNumber => {
  let parsed: WbsNumber;
  try {
    parsed = validateWBS(wbsNum);
  } catch {
    throw new HttpException(400, `"${wbsNum}" is not a valid WBS number, expected a format like "1.2.0"`);
  }

  if (parsed.workPackageNumber !== 0) throw new HttpException(400, `"${wbsNum}" is a work package, not a project`);
  if (parsed.projectNumber === 0) throw new HttpException(400, `"${wbsNum}" is a car, not a project`);

  return parsed;
};

/**
 * Turns an agent's date range into the period the calendar service filters on. The range includes
 * the whole final day, so 2026-09-01 to 2026-09-07 covers everything that happens on the 7th.
 * @param startDate the start of the range
 * @param endDate the last day of the range
 * @returns the period to pass to the calendar service
 * @throws if either date is unparseable, or the range is inverted or wider than MAX_EVENT_RANGE_DAYS
 */
export const parseEventRange = (startDate: Date, endDate: Date): { startPeriod: Date; endPeriod: Date } => {
  // an unparseable date is NaN, and every comparison against NaN is false, so this has to come
  // first or a bad date slips past both range checks and fails inside the query instead
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new HttpException(400, 'startDate and endDate must be valid ISO dates, such as "2026-09-01"');
  }

  if (endDate < startDate) throw new HttpException(400, 'endDate must be on or after startDate');

  // the overlap filter matches slots that start at or before the end of the period, so an endDate of
  // "2026-09-07" would otherwise drop every event starting after midnight on the 7th
  const endPeriod = new Date(endDate);
  endPeriod.setUTCHours(23, 59, 59, 999);

  if ((endPeriod.getTime() - startDate.getTime()) / MS_PER_DAY > MAX_EVENT_RANGE_DAYS) {
    throw new HttpException(400, `Date range must be ${MAX_EVENT_RANGE_DAYS} days or fewer`);
  }

  return { startPeriod: startDate, endPeriod };
};
