import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { WorkPackageContext, ProjectContext, FullUser, DateRange } from '../context.js';
import {
  generateWorkPackageCount,
  generateWorkPackageName,
  generateWorkPackageStage,
  generateWorkPackageTimeline,
  getOverdueStatus,
  workPackageCreateInput
} from '../factories/work-package.factory.js';
import { DAYS_PER_WEEK, daysBetween, WEEK_MS } from '../dates.js';
import { WBS_Element_Status, Work_Package_Stage } from '@prisma/client';
import { seedConfig } from '../seed-config.js';

type WorkPackageInput = OrganizationOutput & UsersOutput & ProjectOutput;

export type WorkPackageOutput = {
  workPackages: WorkPackageContext[];
  workPackagesByProjectId: Record<string, WorkPackageContext[]>;
  // projects re-exported (under different names than ProjectOutput's, since SeedRunner merges every
  // process's output into one flat global context and would collide on a shared key) with `timeline`
  // recomputed as the actual span of their work packages (falling back to the original car-bounded
  // generation window for projects with none), since a project has no dates of its own - it's the
  // summation of its work packages
  projectsWithTimeline: ProjectContext[];
  projectsByCarIdWithTimeline: Record<string, ProjectContext[]>;
  projectsByIdWithTimeline: Record<string, ProjectContext>;
};

type PlannedWorkPackage = {
  orderInProject: number;
  workPackageNumber: number;
  name: string;
  timeline: DateRange;
  stage: Work_Package_Stage | null;
  leadId: string;
  managerId: string;
  status: WBS_Element_Status;
  // index into this same project's planned work package array, if blocked by an earlier one
  blockerIndex?: number;
};

export class WorkPackageProcess extends SeedProcess<WorkPackageInput, WorkPackageOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ProjectProcess];
  }

  async run({ organization, projects, leadership, heads, admins, appAdmins }: WorkPackageInput): Promise<WorkPackageOutput> {
    const { organizationId } = organization;
    const projectOwners = [...leadership, ...heads, ...admins, ...appAdmins];
    const now = new Date();

    // Phase 1: plan every project's work packages synchronously - every faker draw for the entire
    // process happens here, in the same project order every run, with no DB access and no
    // concurrency, so re-running the seed with the same GLOBAL_SEED always produces identical data.
    const plannedByProject = projects.map((projectContext) => ({
      projectContext,
      planned: this.planWorkPackagesForProject(projectContext, projectOwners, now)
    }));

    // Phase 2: create everything. No faker calls below this line - each project's own work
    // packages are created in order (a blocked work package's `connect` needs its blocker's
    // WBS_Element to already exist), but different projects never reference each other, so they
    // can run concurrently for speed without affecting what gets generated.
    const results = await Promise.all(
      plannedByProject.map(async ({ projectContext, planned }) => {
        const workPackageContexts = await this.createPlannedWorkPackages(organizationId, projectContext.project, planned);
        const timeline = this.deriveProjectTimeline(projectContext.timeline, workPackageContexts);

        return {
          workPackageContexts,
          updatedProjectContext: { ...projectContext, timeline }
        };
      })
    );

    const workPackages = results.flatMap((result) => result.workPackageContexts);
    const updatedProjects = results.map((result) => result.updatedProjectContext);

    const workPackagesByProjectId = workPackages.reduce<Record<string, WorkPackageContext[]>>((acc, wpContext) => {
      const { projectId } = wpContext.workPackage;
      acc[projectId] ??= [];
      acc[projectId].push(wpContext);
      return acc;
    }, {});

    const projectsByCarIdWithTimeline = updatedProjects.reduce<Record<string, ProjectContext[]>>((acc, projectContext) => {
      const { carId } = projectContext.project;
      acc[carId] ??= [];
      acc[carId].push(projectContext);
      return acc;
    }, {});

    const projectsByIdWithTimeline = updatedProjects.reduce<Record<string, ProjectContext>>((acc, projectContext) => {
      acc[projectContext.project.projectId] = projectContext;
      return acc;
    }, {});

    return {
      workPackages,
      workPackagesByProjectId,
      projectsWithTimeline: updatedProjects,
      projectsByCarIdWithTimeline,
      projectsByIdWithTimeline
    };
  }

  /**
   * A project has no dates of its own - its effective timeline is the span of its actual work
   * packages. Falls back to the original (car-bounded) generation window for projects with none.
   */
  private deriveProjectTimeline(generationWindow: DateRange, workPackageContexts: WorkPackageContext[]): DateRange {
    if (workPackageContexts.length === 0) return generationWindow;

    return workPackageContexts.reduce<DateRange>(
      (range, { timeline }) => ({
        start: timeline.start < range.start ? timeline.start : range.start,
        end: timeline.end > range.end ? timeline.end : range.end
      }),
      workPackageContexts[0].timeline
    );
  }

  /**
   * Decides everything about one project's work packages - count, blocking relationships,
   * timelines, lead/manager/stage/name, and final status - with zero DB access. Mirrors the
   * original single-pass logic exactly (same faker call order), just computing the final target
   * status directly instead of creating a coarse one and overwriting it with a follow-up update.
   */
  private planWorkPackagesForProject(
    { project, timeline }: ProjectContext,
    projectOwners: FullUser[],
    now: Date
  ): PlannedWorkPackage[] {
    const count = generateWorkPackageCount(this.faker);
    if (count === 0) return [];

    const initialStatus = getOverdueStatus(this.faker, daysBetween({ start: timeline.start, end: now }));
    const usedNames = new Set<string>();
    const planned: PlannedWorkPackage[] = [];

    for (let i = 0; i < count; i++) {
      const orderInProject = i + 1;
      const workPackageNumber = i + 1;

      // determine if this wp is blocked by a previous one
      const shouldBeBlocked = i > 0 && this.faker.datatype.boolean({ probability: seedConfig.workPackage.blockedChance });
      const blockerIndex = shouldBeBlocked ? this.faker.number.int({ min: 0, max: planned.length - 1 }) : undefined;
      const blocker = blockerIndex !== undefined ? planned[blockerIndex] : undefined;

      // if the blocker ends too close to the project end, drop the blocking relationship
      // this would skew the data with 5-10% of blocking relationships being affected in the worst case scenario
      // this happening is extremely rare but does change the data slightly if it does occur.
      const effectiveBlockerIndex =
        blocker && daysBetween({ start: blocker.timeline.end, end: timeline.end }) >= DAYS_PER_WEEK
          ? blockerIndex
          : undefined;
      const effectiveBlockerEnd =
        effectiveBlockerIndex !== undefined ? planned[effectiveBlockerIndex].timeline.end : undefined;

      const wpTimeline = generateWorkPackageTimeline(this.faker, timeline, i === 0, effectiveBlockerEnd);

      const lead = this.faker.helpers.arrayElement(projectOwners);
      const managerPool = projectOwners.filter((u) => u.userId !== lead.userId);
      const manager = this.faker.helpers.arrayElement(managerPool.length > 0 ? managerPool : projectOwners);
      const stage = generateWorkPackageStage(this.faker);

      let name = generateWorkPackageName(this.faker, project.wbsElement.name, stage);
      while (usedNames.has(name)) {
        name = generateWorkPackageName(this.faker, project.wbsElement.name, stage);
      }
      usedNames.add(name);

      planned.push({
        orderInProject,
        workPackageNumber,
        name,
        timeline: wpTimeline,
        stage,
        leadId: lead.userId,
        managerId: manager.userId,
        status: initialStatus === WBS_Element_Status.COMPLETE ? WBS_Element_Status.COMPLETE : WBS_Element_Status.INACTIVE,
        blockerIndex: effectiveBlockerIndex
      });
    }

    // Work package durations are chosen up to a random cap, so nothing otherwise guarantees they
    // collectively reach the project's actual end date - only the first one is anchored to the
    // start. Stretch whichever work package ends latest so its end reaches the project end exactly.
    // This is always safe without checking blocking relationships: any work package that actually
    // blocks another is mathematically guaranteed to end before its blocked successor (the
    // successor's start is the blocker's end + 1 day, plus at least a 1-week duration), so the
    // latest-ending work package in the project can never itself be blocking anything.
    const latest = planned.reduce((a, b) => (a.timeline.end.getTime() >= b.timeline.end.getTime() ? a : b));
    if (latest.timeline.end.getTime() < timeline.end.getTime()) {
      latest.timeline = { start: latest.timeline.start, end: new Date(timeline.end) };
    }

    // Refine statuses for work packages that have already started, overriding the coarse
    // project-wide initial status decided above.
    const sortedIndices = planned
      .map((_, index) => index)
      .sort((a, b) => planned[a].timeline.start.getTime() - planned[b].timeline.start.getTime());
    const pastCount = sortedIndices.filter((index) => planned[index].timeline.start < now).length;

    if (pastCount > 0) {
      const daysOverdue = daysBetween({ start: timeline.start, end: now });
      const projectStatus = getOverdueStatus(this.faker, daysOverdue);
      const hasActiveWP = projectStatus === WBS_Element_Status.ACTIVE;
      const activeIndex = hasActiveWP ? this.faker.number.int({ min: 0, max: pastCount - 1 }) : -1;

      sortedIndices.forEach((plannedIndex, sortedPos) => {
        const wp = planned[plannedIndex];

        if (projectStatus === WBS_Element_Status.COMPLETE) {
          wp.status = WBS_Element_Status.COMPLETE;
        } else if (wp.timeline.start >= now) {
          wp.status = WBS_Element_Status.INACTIVE;
        } else if (sortedPos === activeIndex) {
          wp.status = WBS_Element_Status.ACTIVE;
        } else if (sortedPos < activeIndex) {
          wp.status = WBS_Element_Status.COMPLETE;
        } else if (sortedPos > activeIndex) {
          wp.status = WBS_Element_Status.INACTIVE;
        } else {
          wp.status = WBS_Element_Status.COMPLETE;
        }
      });
    }

    return planned;
  }

  /**
   * Creates one project's already-planned work packages in order (required so a blocked work
   * package's `connect` always finds its blocker's WBS_Element already created). No faker calls -
   * every value was already decided in planWorkPackagesForProject.
   */
  private async createPlannedWorkPackages(
    organizationId: string,
    project: ProjectContext['project'],
    planned: PlannedWorkPackage[]
  ): Promise<WorkPackageContext[]> {
    const { carNumber, projectNumber } = project.wbsElement;
    const created: WorkPackageContext[] = [];

    for (const wp of planned) {
      const blockedByWbsElementIds =
        wp.blockerIndex !== undefined ? [created[wp.blockerIndex].workPackage.wbsElement.wbsElementId] : [];

      const workPackage = await this.prisma.work_Package.create({
        data: workPackageCreateInput(
          organizationId,
          carNumber,
          projectNumber,
          wp.workPackageNumber,
          project.projectId,
          wp.orderInProject,
          wp.name,
          wp.timeline.start,
          Math.ceil((wp.timeline.end.getTime() - wp.timeline.start.getTime()) / WEEK_MS),
          wp.stage,
          wp.status,
          wp.leadId,
          wp.managerId,
          blockedByWbsElementIds
        ),
        include: { wbsElement: true }
      });

      created.push({ workPackage, timeline: wp.timeline });
    }

    return created;
  }
}
