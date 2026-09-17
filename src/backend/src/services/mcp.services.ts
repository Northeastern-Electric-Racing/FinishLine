import { Organization } from '@prisma/client';
import { McpEvent, McpProjectDetail, McpProjectList, McpTaskList, McpWorkPackage, validateWBS } from 'shared';
import prisma from '../prisma/prisma.js';
import { HttpException, NotFoundException } from '../utils/errors.utils.js';
import { buildScheduledTimesOverlap } from '../utils/calendar.utils.js';
import {
  getMcpProjectDetailQueryArgs,
  getMcpProjectSummaryQueryArgs
} from '../prisma-query-args/mcp/projects.query-args.js';
import { getMcpWorkPackageQueryArgs } from '../prisma-query-args/mcp/work-packages.query-args.js';
import { getMcpTaskQueryArgs } from '../prisma-query-args/mcp/tasks.query-args.js';
import { getMcpEventQueryArgs } from '../prisma-query-args/mcp/events.query-args.js';
import { mcpProjectDetailTransformer, mcpProjectSummaryTransformer } from '../transformers/mcp/projects.transformer.js';
import { mcpWorkPackageTransformer } from '../transformers/mcp/work-packages.transformer.js';
import { mcpTaskTransformer } from '../transformers/mcp/tasks.transformer.js';
import { mcpEventTransformer } from '../transformers/mcp/events.transformer.js';

/** The widest event range the MCP API will serve, to keep responses small enough for an LLM. */
const MAX_EVENT_RANGE_DAYS = 7;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * How many items a page of a list endpoint holds. Only the lists that can realistically run past
 * this are paged: a car's projects and a project's tasks. A project's work packages are its handful
 * of phases, and events are already bounded by the one week range, so both return whole.
 */
const PAGE_SIZE = 100;

/**
 * Works out the offset the caller should ask for next, which is absent once the page just returned
 * reaches the end of the list. Returning it saves the model from doing the arithmetic itself.
 *
 * @param offset the offset this page started at
 * @param pageLength how many items this page holds
 * @param total how many items exist in total
 * @returns the next offset, or undefined when there is nothing left
 */
const nextOffsetOf = (offset: number, pageLength: number, total: number): number | undefined =>
  offset + pageLength < total ? offset + pageLength : undefined;

/**
 * Parses a wbs number from a route param and asserts that it identifies a project rather than a
 * work package or a car.
 * @param wbsNum the raw wbs number string, e.g. "1.2.0"
 * @returns the parsed wbs number
 * @throws if the string is malformed or does not identify a project
 */
const parseProjectWbsNum = (wbsNum: string) => {
  let parsed;
  try {
    parsed = validateWBS(wbsNum);
  } catch {
    throw new HttpException(400, `"${wbsNum}" is not a valid WBS number, expected a format like "1.2.0"`);
  }

  if (parsed.workPackageNumber !== 0) {
    throw new HttpException(400, `"${wbsNum}" is a work package, not a project`);
  }

  if (parsed.projectNumber === 0) {
    throw new HttpException(400, `"${wbsNum}" is a car, not a project`);
  }

  return parsed;
};

/**
 * Looks up a project by wbs number within an organization.
 * @returns the project's id and wbs element id
 * @throws if no such project exists
 */
const findProject = async (wbsNum: string, organization: Organization) => {
  const { carNumber, projectNumber, workPackageNumber } = parseProjectWbsNum(wbsNum);

  const wbsElement = await prisma.wBS_Element.findUnique({
    where: {
      wbsNumber: { carNumber, projectNumber, workPackageNumber, organizationId: organization.organizationId }
    },
    select: { wbsElementId: true, dateDeleted: true, project: { select: { projectId: true } } }
  });

  if (!wbsElement || wbsElement.dateDeleted || !wbsElement.project) {
    throw new NotFoundException('Project', wbsNum);
  }

  return { projectId: wbsElement.project.projectId, wbsElementId: wbsElement.wbsElementId };
};

export default class McpService {
  /**
   * Gets the number of the newest car in an organization. There is no "current car" flag in the
   * data; the convention across the app is that the highest car number is the newest.
   * @param organization the organization the request is scoped to
   * @returns the newest car's number
   * @throws if the organization has no cars
   */
  static async getCurrentCarNumber(organization: Organization): Promise<number> {
    const car = await prisma.car.findFirst({
      where: { wbsElement: { organizationId: organization.organizationId, dateDeleted: null } },
      orderBy: { wbsElement: { carNumber: 'desc' } },
      select: { wbsElement: { select: { carNumber: true } } }
    });

    if (!car) throw new HttpException(404, 'This organization has no cars');

    return car.wbsElement.carNumber;
  }

  /**
   * Gets a page of the projects on a car, with just enough to identify and describe it. Defaults to
   * the newest car so that a caller does not need to know which car is current.
   * @param organization the organization the request is scoped to
   * @param carNumber the car number to look at, defaulting to the newest car
   * @param offset how many projects to skip, for paging through a car with more than a page of them
   * @returns the resolved car number alongside a page of its projects
   */
  static async getProjects(
    organization: Organization,
    carNumber?: string | number,
    offset: number = 0
  ): Promise<McpProjectList> {
    let resolvedCarNumber: number;

    if (carNumber === undefined || carNumber === '') {
      resolvedCarNumber = await McpService.getCurrentCarNumber(organization);
    } else {
      resolvedCarNumber = Number(carNumber);
      if (!Number.isInteger(resolvedCarNumber) || resolvedCarNumber < 0) {
        throw new HttpException(400, `"${carNumber}" is not a valid car number`);
      }
    }

    const where = {
      wbsElement: {
        carNumber: resolvedCarNumber,
        dateDeleted: null,
        organizationId: organization.organizationId
      }
    };

    const [total, projects] = await prisma.$transaction([
      prisma.project.count({ where }),
      prisma.project.findMany({
        where,
        orderBy: { wbsElement: { projectNumber: 'asc' } },
        skip: offset,
        take: PAGE_SIZE,
        ...getMcpProjectSummaryQueryArgs()
      })
    ]);

    return {
      carNumber: resolvedCarNumber,
      projects: projects.map(mcpProjectSummaryTransformer),
      total,
      nextOffset: nextOffsetOf(offset, projects.length, total)
    };
  }

  /**
   * Gets the core details of a single project.
   * @param wbsNum the project's wbs number
   * @param organization the organization the request is scoped to
   */
  static async getProject(wbsNum: string, organization: Organization): Promise<McpProjectDetail> {
    const { projectId } = await findProject(wbsNum, organization);

    const project = await prisma.project.findUnique({
      where: { projectId },
      ...getMcpProjectDetailQueryArgs()
    });

    if (!project) throw new NotFoundException('Project', wbsNum);

    return mcpProjectDetailTransformer(project);
  }

  /**
   * Gets the work packages belonging to a project.
   * @param wbsNum the project's wbs number
   * @param organization the organization the request is scoped to
   */
  static async getWorkPackages(wbsNum: string, organization: Organization): Promise<McpWorkPackage[]> {
    const { projectId } = await findProject(wbsNum, organization);

    const workPackages = await prisma.work_Package.findMany({
      where: { projectId, wbsElement: { dateDeleted: null } },
      orderBy: { orderInProject: 'asc' },
      ...getMcpWorkPackageQueryArgs()
    });

    return workPackages.map(mcpWorkPackageTransformer);
  }

  /**
   * Gets a page of the tasks for a project, including tasks on the project's work packages. This
   * matches how the rest of the app scopes a project's tasks.
   *
   * This is the list most likely to be long: an active project accumulates tasks across every one
   * of its work packages, so it is paged rather than returned whole.
   *
   * @param wbsNum the project's wbs number
   * @param organization the organization the request is scoped to
   * @param offset how many tasks to skip, for paging through a project with more than a page of them
   */
  static async getTasks(wbsNum: string, organization: Organization, offset: number = 0): Promise<McpTaskList> {
    const { projectId, wbsElementId } = await findProject(wbsNum, organization);

    const workPackages = await prisma.work_Package.findMany({
      where: { projectId, wbsElement: { dateDeleted: null } },
      select: { wbsElementId: true }
    });

    const wbsElementIds = [wbsElementId, ...workPackages.map((workPackage) => workPackage.wbsElementId)];

    const where = {
      dateDeleted: null,
      wbsElementId: { in: wbsElementIds },
      wbsElement: { dateDeleted: null, organizationId: organization.organizationId }
    };

    const [total, tasks] = await prisma.$transaction([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        orderBy: { dateCreated: 'asc' },
        skip: offset,
        take: PAGE_SIZE,
        ...getMcpTaskQueryArgs()
      })
    ]);

    return {
      tasks: tasks.map((task) => mcpTaskTransformer(task, wbsNum)),
      total,
      nextOffset: nextOffsetOf(offset, tasks.length, total)
    };
  }

  /**
   * Gets the events scheduled within a date range. The range is inclusive of the whole final day, so
   * a request for 2026-09-01 to 2026-09-07 returns everything that happens on the 7th.
   * @param startDate the start of the range
   * @param endDate the end of the range
   * @param organization the organization the request is scoped to
   * @throws if either date is unparseable, or the range is inverted or wider than a week
   */
  static async getEvents(startDate: Date, endDate: Date, organization: Organization): Promise<McpEvent[]> {
    // an unparseable date is NaN, and every comparison against NaN is false, so this has to come
    // first or a bad date slips past both range checks and fails inside the query instead
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new HttpException(400, 'startDate and endDate must be valid ISO dates, such as "2026-09-01"');
    }

    if (endDate < startDate) throw new HttpException(400, 'endDate must be on or after startDate');

    // the overlap filter matches slots that start at or before the end of the range, so an endDate of
    // "2026-09-07" would otherwise drop every event starting after midnight on the 7th
    const rangeEnd = new Date(endDate);
    rangeEnd.setUTCHours(23, 59, 59, 999);

    const rangeDays = (rangeEnd.getTime() - startDate.getTime()) / MS_PER_DAY;
    if (rangeDays > MAX_EVENT_RANGE_DAYS) {
      throw new HttpException(400, `Date range must be ${MAX_EVENT_RANGE_DAYS} days or fewer`);
    }

    const events = await prisma.event.findMany({
      where: {
        dateDeleted: null,
        eventType: { organizationId: organization.organizationId, dateDeleted: null },
        scheduledTimes: buildScheduledTimesOverlap(startDate, rangeEnd)
      },
      ...getMcpEventQueryArgs(startDate, rangeEnd)
    });

    return events.map(mcpEventTransformer);
  }
}
