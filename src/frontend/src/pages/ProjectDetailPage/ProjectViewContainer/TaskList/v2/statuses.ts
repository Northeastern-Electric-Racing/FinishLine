import { Task, TaskStatus, TaskPriority } from 'shared';

export const statuses: Task['status'][] = [TaskStatus.IN_BACKLOG, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

export const statusNames: Record<Task['status'], string> = {
  IN_BACKLOG: 'Backlog',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done'
};

export type TasksByStatus = Record<Task['status'], Task[]>;

const rankTaskPriority = (priority: TaskPriority) => {
  if (priority === TaskPriority.High) return 2;
  if (priority === TaskPriority.Medium) return 1;
  return 0;
};

const compareTaskPriorities = (priorityA: TaskPriority, priorityB: TaskPriority) => {
  return rankTaskPriority(priorityA) - rankTaskPriority(priorityB);
};

export const getTasksByStatus = (unorderedTasks: Task[]) => {
  const postsByStatus: TasksByStatus = unorderedTasks.reduce(
    (acc, task) => {
      acc[task.status].push(task);
      return acc;
    },
    statuses.reduce((obj, status) => ({ ...obj, [status]: [] }), {} as TasksByStatus)
  );
  // order each column by priority
  statuses.forEach((status) => {
    postsByStatus[status] = postsByStatus[status].sort((recordA: Task, recordB: Task) =>
      compareTaskPriorities(recordA.priority, recordB.priority)
    );
  });
  return postsByStatus;
};
