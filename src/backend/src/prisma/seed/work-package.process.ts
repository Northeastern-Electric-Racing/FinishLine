import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { WorkPackageContext, ProjectContext, FullUser } from '../context.js';
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
};

const BLOCKED_PERCENTAGE = 0.3;

export class WorkPackageProcess extends SeedProcess<WorkPackageInput, WorkPackageOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess, ProjectProcess];
  }

  async run({ organization, projects, leadership, heads, admins, appAdmins }: WorkPackageInput): Promise<WorkPackageOutput> {
    const { organizationId } = organization;
    const projectOwners = [...leadership, ...heads, ...admins, ...appAdmins];

    const allWorkPackageContexts = await Promise.all(
      projects.map((projectContext) => this.generateWorkPackagesForProject(organizationId, projectContext, projectOwners))
    );

    const workPackages = allWorkPackageContexts.flat();

    const workPackagesByProjectId = workPackages.reduce<Record<string, WorkPackageContext[]>>((acc, wpContext) => {
      const { projectId } = wpContext.workPackage;
      acc[projectId] ??= [];
      acc[projectId].push(wpContext);
      return acc;
    }, {});

    return { workPackages, workPackagesByProjectId };
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

    // Work package durations are chosen up to a random cap, so nothing otherwise guarantees they
    // collectively reach the project's actual end date - only the first one is anchored to the
    // start. Stretch whichever work package ends latest so its end reaches the project end exactly.
    // This is always safe to do without checking blocking relationships: any work package that
    // actually blocks another is mathematically guaranteed to end before its blocked successor
    // (the successor's start is the blocker's end + 1 day, plus at least a 1-week duration), so the
    // latest-ending work package in the project can never itself be blocking anything.
    if (workPackageContexts.length > 0) {
      const latest = workPackageContexts.reduce((a, b) => (a.timeline.end.getTime() >= b.timeline.end.getTime() ? a : b));

      if (latest.timeline.end.getTime() < timeline.end.getTime()) {
        const stretchedDuration = Math.max(
          1,
          Math.ceil((timeline.end.getTime() - latest.timeline.start.getTime()) / WEEK_MS)
        );

        await this.prisma.work_Package.update({
          where: { workPackageId: latest.workPackage.workPackageId },
          data: { duration: stretchedDuration }
        });

        latest.timeline = { start: latest.timeline.start, end: new Date(timeline.end) };
      }
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
