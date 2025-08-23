import { Task } from 'shared';

/**
 * Transforms a task to ensure deep field transformation of date objects.
 *
 * @param task Incoming task object supplied by the HTTP response.
 * @returns Properly transformed task object.
 */
export const taskTransformer = (task: Task): Task => {
  console.log('This is the task deadline from backend', task.deadline);
  let transformedDeadline: Date | undefined;
  if (task.deadline) {
    const [year, month, day] = task.deadline.toString().split('T')[0].split('-').map(Number);
    transformedDeadline = new Date(year, month - 1, day);
  }
  return {
    ...task,
    dateCreated: new Date(task.dateCreated),
    dateDeleted: task.dateDeleted ? new Date(task.dateDeleted) : undefined,
    deadline: task.deadline ? transformedDeadline : undefined
  };
};
