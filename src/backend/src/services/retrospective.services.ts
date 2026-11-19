import prisma from '../prisma/prisma.js';
import {
  calculateProjectOriginalEndDate,
  calculateProjectOriginalStartDate,
  RetrospectiveProject,
  RetrospectiveWorkPackage
} from 'shared';
import {
  getBaseProjectQueryArgs,
  getDesignReviewMarkerQueryArgs,
  notCompleteProjectWhere
} from '../prisma-query-args/projects.query-args.js';
import { getBaseWorkPackageQueryArgs } from '../prisma-query-args/work-packages.query-args.js';
import { baseProjectTransformer, designReviewMarkerTransformer } from '../transformers/projects.transformer.js';
import { baseWorkPackageTransformer } from '../transformers/work-packages.transformer.js';
import { getBaseTaskQueryArgs } from '../prisma-query-args/tasks.query-args.js';
import { getBaseUserQueryArgs } from '../prisma-query-args/user.query-args.js';
import { baseTaskTransformer } from '../transformers/tasks.transformer.js';
import { baseUserTransformer } from '../transformers/user.transformer.js';
import { wbsNumOf } from '../utils/utils.js';

type ScheduleChange = { detail: string; dateImplemented: Date };

/**
 * Works out a work package's schedule before and after the changes in the window. The first duration / start date change
 * in the window holds the original value, and the last one holds the value the window ended on.
 * Change details look like `Changed duration from "2" to "3"` or `Added start date "2024-01-01"`
 */
const applyScheduleChanges = (
  workPackage: { startDate: Date; duration: number },
  changes: ScheduleChange[] // oldest first
) => {
  const schedule = {
    startDate: workPackage.startDate,
    duration: workPackage.duration,
    originalStartDate: workPackage.startDate,
    originalDuration: workPackage.duration
  };

  const durationChanges = changes.filter(({ detail }) => /^(added|changed) duration/i.test(detail));
  const startChanges = changes.filter(({ detail }) => /^(added|changed) start date/i.test(detail));

  // split on quotes: [prefix, original, ' to ', new, '']
  const [firstDuration] = durationChanges;
  if (firstDuration) schedule.originalDuration = parseFloat(firstDuration.detail.split('"')[1]);
  const lastDuration = durationChanges.at(-1)?.detail.split('"');
  if (lastDuration && lastDuration.length > 3) schedule.duration = parseFloat(lastDuration[3]);

  const [firstStart] = startChanges;
  if (firstStart) schedule.originalStartDate = new Date(firstStart.detail.split('"')[1]);
  const lastStart = startChanges.at(-1)?.detail.split('"');
  if (lastStart && lastStart.length > 3) schedule.startDate = new Date(lastStart[3]);

  return schedule;
};

export default class RetrospectiveService {
  /**
   * Gets the projects for the retrospective chart, with each work package's schedule before and after the window's changes
   * @param organizationId the organization the user is currently in
   * @param startDate only changes on or after this count
   * @param endDate only changes on or before this count
   */
  static async getRetrospectiveTimelines(
    organizationId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<RetrospectiveProject[]> {
    const projects = await prisma.project.findMany({
      // the chart only shows projects that aren't deleted or complete
      where: { wbsElement: { organizationId, dateDeleted: null }, ...notCompleteProjectWhere },
      select: {
        ...getBaseProjectQueryArgs().select,
        wbsElement: {
          select: {
            ...getBaseProjectQueryArgs().select.wbsElement.select,
            // drawn as task bars, the same as on the projects gantt
            tasks: {
              where: { dateDeleted: null },
              select: {
                ...getBaseTaskQueryArgs().select,
                startDate: true,
                createdBy: getBaseUserQueryArgs(),
                blockedBy: { select: { taskId: true } }
              }
            }
          }
        },
        workPackages: {
          where: { wbsElement: { dateDeleted: null } },
          select: {
            ...getBaseWorkPackageQueryArgs().select,
            wbsElement: {
              select: {
                ...getBaseWorkPackageQueryArgs().select.wbsElement.select,
                blocking: {
                  where: { wbsElement: { dateDeleted: null } },
                  select: { wbsElement: { select: { carNumber: true, projectNumber: true, workPackageNumber: true } } }
                },
                // just the schedule changes in the window, oldest first
                changes: {
                  where: {
                    changeRequest: { dateDeleted: null },
                    dateImplemented: { gte: startDate, lte: endDate },
                    OR: [
                      { detail: { contains: 'duration', mode: 'insensitive' } },
                      { detail: { contains: 'start date', mode: 'insensitive' } }
                    ]
                  },
                  select: { detail: true, dateImplemented: true },
                  orderBy: { dateImplemented: 'asc' }
                }
              }
            },
            // unblocked work packages start the chart's dependency trees
            _count: { select: { blockedBy: { where: { dateDeleted: null } } } },
            events: { where: { dateDeleted: null }, ...getDesignReviewMarkerQueryArgs() }
          }
        }
      }
    });

    return projects.map((project) => {
      // the project's dates come from where the window left its work packages
      const workPackages = project.workPackages.map((wp) => ({
        ...wp,
        ...applyScheduleChanges(wp, wp.wbsElement.changes)
      }));

      const retrospectiveWorkPackages: RetrospectiveWorkPackage[] = workPackages.map((wp) => ({
        ...baseWorkPackageTransformer(wp),
        blocking: wp.wbsElement.blocking.map(({ wbsElement }) => wbsNumOf(wbsElement)),
        events: wp.events.map((event) =>
          designReviewMarkerTransformer(event, `${project.wbsElement.name} - ${wp.wbsElement.name}`)
        ),
        isBlocked: wp._count.blockedBy > 0,
        originalStartDate: wp.originalStartDate,
        originalDuration: wp.originalDuration
      }));

      return {
        ...baseProjectTransformer({ ...project, workPackages }),
        originalStartDate: calculateProjectOriginalStartDate(workPackages),
        originalEndDate: calculateProjectOriginalEndDate(workPackages),
        tasks: project.wbsElement.tasks.map((task) => ({
          ...baseTaskTransformer(task),
          startDate: task.startDate ?? undefined,
          createdBy: baseUserTransformer(task.createdBy),
          blockedBy: task.blockedBy
        })),
        workPackages: retrospectiveWorkPackages
      };
    });
  }
}
