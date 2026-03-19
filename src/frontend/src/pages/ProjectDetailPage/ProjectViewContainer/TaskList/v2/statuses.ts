import { Task, TaskStatus, TaskPriority, TaskWithIndex } from 'shared';

export const statuses: Task['status'][] = [TaskStatus.IN_BACKLOG, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

export const statusNames: Record<Task['status'], string> = {
  IN_BACKLOG: 'Backlog',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done'
};

export type TasksByStatus = Record<Task['status'], TaskWithIndex[]>;

const rankTaskPriority = (priority: TaskPriority) => {
  if (priority === TaskPriority.High) return 2;
  if (priority === TaskPriority.Medium) return 1;
  return 0;
};

const compareTasks = (taskA: Task, taskB: Task) => {
  const deadlineA = taskA.deadline ? new Date(taskA.deadline).getTime() : Infinity;
  const deadlineB = taskB.deadline ? new Date(taskB.deadline).getTime() : Infinity;
  if (deadlineA !== deadlineB) return deadlineA - deadlineB;
  return rankTaskPriority(taskB.priority) - rankTaskPriority(taskA.priority);
};

export const getTasksByStatus = (unorderedTasks: Task[]) => {
  const postsByStatus: TasksByStatus = unorderedTasks.reduce(
    (acc, task) => {
      acc[task.status].push({ ...task, index: acc[task.status].length });
      return acc;
    },
    statuses.reduce((obj, status) => ({ ...obj, [status]: [] }), {} as TasksByStatus)
  );
  // order each column by due date, then priority as tiebreaker
  statuses.forEach((status) => {
    postsByStatus[status] = postsByStatus[status].sort(compareTasks);
  });
  return postsByStatus;
};
