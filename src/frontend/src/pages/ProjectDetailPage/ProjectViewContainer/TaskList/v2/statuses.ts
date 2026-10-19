import { BaseTask, TaskBoardItem, TaskStatus, TaskPriority, TaskWithIndex } from 'shared';

export const statuses: TaskStatus[] = [TaskStatus.IN_BACKLOG, TaskStatus.IN_PROGRESS, TaskStatus.DONE];

export const statusNames: Record<TaskStatus, string> = {
  IN_BACKLOG: 'Backlog',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done'
};

export type TasksByStatus = Record<TaskStatus, TaskWithIndex[]>;

const rankTaskPriority = (priority: TaskPriority) => {
  if (priority === TaskPriority.High) return 2;
  if (priority === TaskPriority.Medium) return 1;
  return 0;
};

const compareTasks = (taskA: Pick<BaseTask, 'deadline' | 'priority'>, taskB: Pick<BaseTask, 'deadline' | 'priority'>) => {
  const deadlineA = taskA.deadline ? new Date(taskA.deadline).getTime() : Infinity;
  const deadlineB = taskB.deadline ? new Date(taskB.deadline).getTime() : Infinity;
  if (deadlineA !== deadlineB) return deadlineA - deadlineB;
  return rankTaskPriority(taskB.priority) - rankTaskPriority(taskA.priority);
};

export const getTasksByStatus = (unorderedTasks: TaskBoardItem[]) => {
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
