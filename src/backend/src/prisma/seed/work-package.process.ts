import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { WorkPackageContext, ProjectContext, FullUser } from '../context.js';
import {
  generateWorkPackageCount,
  generateWorkPackageStage,
  generateWorkPackageTimeline,
  workPackageCreateInput
} from '../factories/work-package.factory.js';
import { DAYS_PER_WEEK, daysBetween, WEEK_MS } from '../dates.js';

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

      const wpTimeline = generateWorkPackageTimeline(this.faker, timeline, effectiveBlocker?.timeline.end);

      // pick lead and manager
      const lead = this.faker.helpers.arrayElement(projectOwners);
      const managerPool = projectOwners.filter((u) => u.userId !== lead.userId);
      const manager = this.faker.helpers.arrayElement(managerPool.length > 0 ? managerPool : projectOwners);
      const stage = generateWorkPackageStage(this.faker);
      const name = `${project.wbsElement.name} WP${workPackageNumber}`;

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
          lead.userId,
          manager.userId,
          blockedByWbsElementIds
        ),
        include: { wbsElement: true }
      });

      workPackageContexts.push({ workPackage, timeline: wpTimeline });
    }

    return workPackageContexts;
  }
}
