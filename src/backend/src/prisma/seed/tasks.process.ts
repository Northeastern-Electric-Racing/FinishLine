import { Task } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { WorkPackageOutput, WorkPackageProcess } from './work-package.process.js';
import { SeedTaskParent, assigneeCountForTask, createSeedTask, taskCountForProject } from '../factories/tasks.factory.js';

type TaskInput = UsersOutput & WorkPackageOutput;

export type TaskOutput = {
  tasks: Task[];
  tasksByWbsElementId: Record<string, Task[]>;
};

const WP_ATTACH_PROBABILITY = 0.4;

export class TaskProcess extends SeedProcess<TaskInput, TaskOutput> {
  dependencies() {
    return [UsersProcess, WorkPackageProcess];
  }

  async run({
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

    const tasks: Task[] = [];

    for (const { project, timeline } of projectsWithTimeline) {
      const projectWorkPackages = workPackagesByProjectId[project.projectId] ?? [];
      const taskCount = taskCountForProject(this.faker);

      const projectTasks = await Promise.all(
        Array.from({ length: taskCount }, () => {
          // attach to a work package sometimes, but only if the project has any
          const attachToWorkPackage =
            projectWorkPackages.length > 0 && this.faker.datatype.boolean({ probability: WP_ATTACH_PROBABILITY });

          let parent: SeedTaskParent;
          if (attachToWorkPackage) {
            const { workPackage, timeline: wpTimeline } = this.faker.helpers.arrayElement(projectWorkPackages);
            parent = { wbsElementId: workPackage.wbsElement.wbsElementId, timeline: wpTimeline };
          } else {
            parent = { wbsElementId: project.wbsElementId, timeline };
          }

          const creator = this.faker.helpers.arrayElement(assignableUsers);

          const assigneeCount = assigneeCountForTask(this.faker);
          const assigneeIds = this.faker.helpers
            .arrayElements(assignableUsers, Math.min(assigneeCount, assignableUsers.length))
            .map((user) => user.userId);

          return this.prisma.task.create({
            data: createSeedTask(this.faker, parent, creator.userId, assigneeIds)
          });
        })
      );

      tasks.push(...projectTasks);
    }

    const tasksByWbsElementId = tasks.reduce<Record<string, Task[]>>((acc, task) => {
      acc[task.wbsElementId] ??= [];
      acc[task.wbsElementId].push(task);
      return acc;
    }, {});

    return {
      tasks,
      tasksByWbsElementId
    };
  }
}
