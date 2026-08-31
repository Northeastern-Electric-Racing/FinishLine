import { Organization } from '@prisma/client';
import { McpEvent, McpProjectDetail, McpProjectSummary, McpTask, McpWorkPackage, validateWBS } from 'shared';
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
   * Gets every project on a car, with just enough to identify and describe it.
   * @param carNumber the car number, e.g. 3
   * @param organization the organization the request is scoped to
   */
  static async getProjectsByCarNumber(carNumber: number, organization: Organization): Promise<McpProjectSummary[]> {
    const projects = await prisma.project.findMany({
      where: {
        wbsElement: { carNumber, dateDeleted: null, organizationId: organization.organizationId }
      },
      orderBy: { wbsElement: { projectNumber: 'asc' } },
      ...getMcpProjectSummaryQueryArgs()
    });

    return projects.map(mcpProjectSummaryTransformer);
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
   * Gets the tasks for a project, including tasks on the project's work packages. This matches how
   * the rest of the app scopes a project's tasks.
   * @param wbsNum the project's wbs number
   * @param organization the organization the request is scoped to
   */
  static async getTasks(wbsNum: string, organization: Organization): Promise<McpTask[]> {
    const { projectId, wbsElementId } = await findProject(wbsNum, organization);

    const workPackages = await prisma.work_Package.findMany({
      where: { projectId, wbsElement: { dateDeleted: null } },
      select: { wbsElementId: true }
    });

    const wbsElementIds = [wbsElementId, ...workPackages.map((workPackage) => workPackage.wbsElementId)];

    const tasks = await prisma.task.findMany({
      where: {
        dateDeleted: null,
        wbsElementId: { in: wbsElementIds },
        wbsElement: { dateDeleted: null, organizationId: organization.organizationId }
      },
      orderBy: { dateCreated: 'asc' },
      ...getMcpTaskQueryArgs()
    });

    return tasks.map((task) => mcpTaskTransformer(task, wbsNum));
  }

  /**
   * Gets the events scheduled within a date range. The range is inclusive of the whole final day, so
   * a request for 2026-09-01 to 2026-09-07 returns everything that happens on the 7th.
   * @param startDate the start of the range
   * @param endDate the end of the range
   * @param organization the organization the request is scoped to
   * @throws if the range is inverted or wider than a week
   */
  static async getEvents(startDate: Date, endDate: Date, organization: Organization): Promise<McpEvent[]> {
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
