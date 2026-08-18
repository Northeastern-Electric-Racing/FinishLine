import { Prisma, Task, Task_Label, Task_Status } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import { TeamJoinRequestProcess } from './team-join-request.process.js';
import {
  SeedTaskParent,
  assigneeCountForTask,
  createSeedTask,
  labelCountForTask,
  taskCountForProject,
  taskLabelCreateInputs
} from '../factories/tasks.factory.js';

type TaskInput = OrganizationOutput & UsersOutput & WorkPackageOutput;

export type TaskOutput = {
  tasks: Task[];
  tasksByWbsElementId: Record<string, Task[]>;
};

const WP_ATTACH_PROBABILITY = 0.4;
const BLOCKED_BY_TASK_PROBABILITY = 0.15;

type TaskDraft = {
  data: Prisma.TaskCreateInput;
  status: Task_Status;
  blockedByIndices: number[];
};

export class TaskProcess extends SeedProcess<TaskInput, TaskOutput> {
  dependencies() {
    return [
      OrganizationProcess,
      UsersProcess,
      WorkPackageProcess,
      // Ensures guest -> member promotions from approved join requests have landed before this
      // process picks task assignees from the `members` pool.
      TeamJoinRequestProcess
    ];
  }

  async run({
    organization,
    projectsWithTimeline,
    members,
    leadership,
    heads,
    admins,
    appAdmins,
    workPackagesByProjectId
  }: TaskInput): Promise<TaskOutput> {
    if (projectsWithTimeline.length === 0) {
      throw new Error('TaskProcess requires at least one project.');
    }

    const assignableUsers = [...members, ...leadership, ...heads, ...admins, ...appAdmins];

    if (assignableUsers.length === 0) {
      throw new Error('TaskProcess requires at least one assignable user.');
    }

    // createTaskLabel restricts label creation to admins/app admins, so labels here must be
    // authored by one to stay reachable through the real service function.
    const labelCreatorPool = [...admins, ...appAdmins];
    if (labelCreatorPool.length === 0) {
      throw new Error('TaskProcess requires at least one admin to create task labels.');
    }
    const labelCreator = this.faker.helpers.arrayElement(labelCreatorPool);

    const labelInputs = taskLabelCreateInputs(organization.organizationId, labelCreator.userId);
    const labels: Task_Label[] = await Promise.all(labelInputs.map((data) => this.prisma.task_Label.create({ data })));

    // Work_Package.blockedBy (WBS-element level) - a task can't be created/marked DONE if its own
    // work package is still blocked by another work package that has any non-done task
    // (see getActiveTaskBlockerNames). Work packages only ever block a *lower-orderInProject*
    // work package in the same project (see work-package.process.ts), so processing work packages
    // in array order guarantees a blocker's tasks are already decided by the time its dependents run.
    const workPackageRows = await this.prisma.work_Package.findMany({
      select: { workPackageId: true, blockedBy: { select: { wbsElementId: true } } }
    });
    const blockedByByWorkPackageId = new Map<string, string[]>(
      workPackageRows.map((wp) => [wp.workPackageId, wp.blockedBy.map((b) => b.wbsElementId)])
    );

    const allDrafts: TaskDraft[] = [];
    const statusesByWbsElementId = new Map<string, Task_Status[]>();

    const pickBlockedByIndices = (candidateIndices: number[], requireDone: boolean): number[] => {
      if (candidateIndices.length === 0) return [];
      if (!this.faker.datatype.boolean({ probability: BLOCKED_BY_TASK_PROBABILITY })) return [];

      const eligible = requireDone
        ? candidateIndices.filter((index) => allDrafts[index].status === Task_Status.DONE)
        : candidateIndices;

      return eligible.length === 0 ? [] : [this.faker.helpers.arrayElement(eligible)];
    };

    for (const { project, timeline } of projectsWithTimeline) {
      const projectWorkPackages = workPackagesByProjectId[project.projectId] ?? [];
      const taskCount = taskCountForProject(this.faker);

      const wpTaskCounts = new Map<number, number>();
      let projectTaskSlotCount = 0;
      for (let i = 0; i < taskCount; i++) {
        const attachToWorkPackage =
          projectWorkPackages.length > 0 && this.faker.datatype.boolean({ probability: WP_ATTACH_PROBABILITY });

        if (attachToWorkPackage) {
          const wpIndex = this.faker.number.int({ min: 0, max: projectWorkPackages.length - 1 });
          wpTaskCounts.set(wpIndex, (wpTaskCounts.get(wpIndex) ?? 0) + 1);
        } else {
          projectTaskSlotCount++;
        }
      }

      // candidate blockers are scoped to this project's own tasks generated so far
      const projectDraftIndices: number[] = [];

      const buildDraft = (parent: SeedTaskParent, canBeDone: boolean) => {
        const creator = this.faker.helpers.arrayElement(assignableUsers);

        const assigneeCount = assigneeCountForTask(this.faker);
        const assigneeIds = this.faker.helpers
          .arrayElements(assignableUsers, Math.min(assigneeCount, assignableUsers.length))
          .map((user) => user.userId);

        const labelIds = this.faker.helpers
          .arrayElements(labels, Math.min(labelCountForTask(this.faker), labels.length))
          .map((label) => label.taskLabelId);

        const data = createSeedTask(this.faker, parent, creator.userId, assigneeIds, labelIds, canBeDone);
        const status = data.status as Task_Status;

        const blockedByIndices = pickBlockedByIndices(projectDraftIndices, status === Task_Status.DONE);

        const index = allDrafts.length;
        allDrafts.push({ data, status, blockedByIndices });
        projectDraftIndices.push(index);

        const list = statusesByWbsElementId.get(parent.wbsElementId) ?? [];
        list.push(status);
        statusesByWbsElementId.set(parent.wbsElementId, list);
      };

      const projectParent: SeedTaskParent = { wbsElementId: project.wbsElementId, timeline };
      for (let i = 0; i < projectTaskSlotCount; i++) {
        buildDraft(projectParent, true);
      }

      for (let wpIndex = 0; wpIndex < projectWorkPackages.length; wpIndex++) {
        const { workPackage, timeline: wpTimeline } = projectWorkPackages[wpIndex];
        const {
          wbsElement: { wbsElementId }
        } = workPackage;
        const count = wpTaskCounts.get(wpIndex) ?? 0;

        if (count === 0) {
          statusesByWbsElementId.set(wbsElementId, statusesByWbsElementId.get(wbsElementId) ?? []);
          continue;
        }

        const blockingWbsElementIds = blockedByByWorkPackageId.get(workPackage.workPackageId) ?? [];
        const blockingWpStillActive = blockingWbsElementIds.some((id) => {
          const statuses = statusesByWbsElementId.get(id);
          return !statuses || statuses.some((s) => s !== Task_Status.DONE);
        });

        const wpParent: SeedTaskParent = { wbsElementId, timeline: wpTimeline };
        for (let i = 0; i < count; i++) {
          buildDraft(wpParent, !blockingWpStillActive);
        }
      }
    }

    const createdTasks = await Promise.all(allDrafts.map(({ data }) => this.prisma.task.create({ data })));

    await Promise.all(
      allDrafts.map(({ blockedByIndices }, index) => {
        if (blockedByIndices.length === 0) return Promise.resolve();

        return this.prisma.task.update({
          where: { taskId: createdTasks[index].taskId },
          data: {
            blockedBy: {
              connect: blockedByIndices.map((blockerIndex) => ({ taskId: createdTasks[blockerIndex].taskId }))
            }
          }
        });
      })
    );

    const tasksByWbsElementId = createdTasks.reduce<Record<string, Task[]>>((acc, task) => {
      acc[task.wbsElementId] ??= [];
      acc[task.wbsElementId].push(task);
      return acc;
    }, {});

    return {
      tasks: createdTasks,
      tasksByWbsElementId
    };
  }
}
