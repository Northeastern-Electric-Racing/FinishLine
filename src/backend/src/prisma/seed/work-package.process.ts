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
import { WBS_Element_Status } from '@prisma/client';

type WorkPackageInput = OrganizationOutput & UsersOutput & ProjectOutput;

export type WorkPackageOutput = {
  workPackages: WorkPackageContext[];
  workPackagesByProjectId: Record<string, WorkPackageContext[]>;
  // projects re-exported with `timeline` recomputed as the actual span of their work packages
  // (falling back to the original car-bounded generation window for projects with none), since
  // a project has no dates of its own - it's the summation of its work packages
  projects: ProjectContext[];
  projectsByCarId: Record<string, ProjectContext[]>;
  projectsById: Record<string, ProjectContext>;
};

const BLOCKED_PERCENTAGE = 0.3;

export class WorkPackageProcess extends SeedProcess<WorkPackageInput, WorkPackageOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ProjectProcess];
  }

  async run({ organization, projects, leadership, heads, admins, appAdmins }: WorkPackageInput): Promise<WorkPackageOutput> {
    const { organizationId } = organization;
    const projectOwners = [...leadership, ...heads, ...admins, ...appAdmins];

    const results = await Promise.all(
      projects.map(async (projectContext) => {
        const workPackageContexts = await this.generateWorkPackagesForProject(organizationId, projectContext, projectOwners);
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

    const projectsByCarId = updatedProjects.reduce<Record<string, ProjectContext[]>>((acc, projectContext) => {
      const { carId } = projectContext.project;
      acc[carId] ??= [];
      acc[carId].push(projectContext);
      return acc;
    }, {});

    const projectsById = updatedProjects.reduce<Record<string, ProjectContext>>((acc, projectContext) => {
      acc[projectContext.project.projectId] = projectContext;
      return acc;
    }, {});

    return { workPackages, workPackagesByProjectId, projects: updatedProjects, projectsByCarId, projectsById };
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

  private async generateWorkPackagesForProject(
    organizationId: string,
    { project, timeline }: ProjectContext,
    projectOwners: FullUser[]
  ): Promise<WorkPackageContext[]> {
    const count = generateWorkPackageCount(this.faker);
    if (count === 0) return [];

    const { carNumber, projectNumber } = project.wbsElement;
    const workPackageContexts: WorkPackageContext[] = [];
    const usedNames = new Set<string>();

    const now = new Date();

    const status = getOverdueStatus(this.faker, daysBetween({ start: timeline.start, end: now }));

    for (let i = 0; i < count; i++) {
      // for clarity
      const orderInProject = i + 1;
      const workPackageNumber = i + 1;

      // determine if this wp is blocked by a previous one
      const shouldBeBlocked = i > 0 && this.faker.datatype.boolean({ probability: BLOCKED_PERCENTAGE });
      const blocker = shouldBeBlocked
        ? workPackageContexts[this.faker.number.int({ min: 0, max: workPackageContexts.length - 1 })]
        : undefined;

      // if the blocker ends too close to the project end, drop the blocking relationship
      // this would skew the data with 5-10% of blocking relationships being affected in the worst case scenario
      // this happening is extremely rare but does change the data slightly if it does occur.
      const effectiveBlocker =
        blocker && daysBetween({ start: blocker.timeline.end, end: timeline.end }) >= DAYS_PER_WEEK ? blocker : undefined;

      const wpTimeline = generateWorkPackageTimeline(this.faker, timeline, i === 0, effectiveBlocker?.timeline.end);

      // pick lead and manager
      const lead = this.faker.helpers.arrayElement(projectOwners);
      const managerPool = projectOwners.filter((u) => u.userId !== lead.userId);
      const manager = this.faker.helpers.arrayElement(managerPool.length > 0 ? managerPool : projectOwners);
      const stage = generateWorkPackageStage(this.faker);

      let name = generateWorkPackageName(this.faker, project.wbsElement.name, stage);
      while (usedNames.has(name)) {
        name = generateWorkPackageName(this.faker, project.wbsElement.name, stage);
      }
      usedNames.add(name);

      const blockedByWbsElementIds = effectiveBlocker ? [effectiveBlocker.workPackage.wbsElement.wbsElementId] : [];

      const workPackage = await this.prisma.work_Package.create({
        data: workPackageCreateInput(
          organizationId,
          carNumber,
          projectNumber,
          workPackageNumber,
          project.projectId,
          orderInProject,
          name,
          wpTimeline.start,
          Math.ceil((wpTimeline.end.getTime() - wpTimeline.start.getTime()) / WEEK_MS),
          stage,
          status === WBS_Element_Status.COMPLETE ? WBS_Element_Status.COMPLETE : WBS_Element_Status.INACTIVE,
          lead.userId,
          manager.userId,
          blockedByWbsElementIds
        ),
        include: { wbsElement: true }
      });

      workPackageContexts.push({ workPackage, timeline: wpTimeline });
    }

    const sorted = [...workPackageContexts].sort((a, b) => a.timeline.start.getTime() - b.timeline.start.getTime());
    const pastWPs = sorted.filter((wp) => wp.timeline.start < now);

    if (pastWPs.length > 0) {
      const daysOverdue = daysBetween({ start: timeline.start, end: now });
      const projectStatus = getOverdueStatus(this.faker, daysOverdue);
      const hasActiveWP = projectStatus === WBS_Element_Status.ACTIVE;

      const activeIndex = hasActiveWP ? this.faker.number.int({ min: 0, max: pastWPs.length - 1 }) : -1;

      await Promise.all(
        sorted.map((ctx, index) => {
          if (projectStatus === WBS_Element_Status.COMPLETE) {
            return this.prisma.wBS_Element.update({
              where: { wbsElementId: ctx.workPackage.wbsElement.wbsElementId },
              data: { status: WBS_Element_Status.COMPLETE }
            });
          }

          let status: WBS_Element_Status;

          if (ctx.timeline.start >= now) {
            status = WBS_Element_Status.INACTIVE;
          } else if (index === activeIndex) {
            status = WBS_Element_Status.ACTIVE;
          } else if (index < activeIndex) {
            status = WBS_Element_Status.COMPLETE;
          } else if (index > activeIndex) {
            status = WBS_Element_Status.INACTIVE;
          } else {
            status = WBS_Element_Status.COMPLETE;
          }

          return this.prisma.wBS_Element.update({
            where: { wbsElementId: ctx.workPackage.wbsElement.wbsElementId },
            data: { status }
          });
        })
      );
    }

    return workPackageContexts;
  }
}
