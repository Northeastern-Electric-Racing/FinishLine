import { Task } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { ProjectOutput, ProjectProcess } from './project.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { assigneeCountForTask, createSeedTask, taskCountForProject } from '../factories/tasks.factory.js';

type TaskInput = ProjectOutput & UsersOutput;

export type TaskOutput = {
  tasks: Task[];
  tasksByWbsElementId: Record<string, Task[]>;
};

export class TaskProcess extends SeedProcess<TaskInput, TaskOutput> {
  dependencies() {
    return [ProjectProcess, UsersProcess];
  }

  async run({ projects, members, leadership, heads, admins, appAdmins }: TaskInput): Promise<TaskOutput> {
    if (projects.length === 0) {
      throw new Error('TaskProcess requires at least one project.');
    }

    const assignableUsers = [...members, ...leadership, ...heads, ...admins, ...appAdmins];

    if (assignableUsers.length === 0) {
      throw new Error('TaskProcess requires at least one assignable user.');
    }

    const tasks: Task[] = [];

    for (const { project, timeline } of projects) {
      const taskCount = taskCountForProject(this.faker);

      for (let i = 0; i < taskCount; i++) {
        const creator = this.faker.helpers.arrayElement(assignableUsers);

        const assigneeCount = assigneeCountForTask(this.faker);
        const assigneeIds = this.faker.helpers
          .arrayElements(assignableUsers, Math.min(assigneeCount, assignableUsers.length))
          .map((user) => user.userId);

        const task = await this.prisma.task.create({
          data: createSeedTask(
            this.faker,
            {
              wbsElementId: project.wbsElementId,
              timeline
            },
            creator.userId,
            assigneeIds
          )
        });

        tasks.push(task);
      }
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
