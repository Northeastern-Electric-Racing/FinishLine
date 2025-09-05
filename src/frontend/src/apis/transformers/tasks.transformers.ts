import { Task } from 'shared';

/**
 * Transforms a task to ensure deep field transformation of date objects.
 *
 * @param task Incoming task object supplied by the HTTP response.
 * @returns Properly transformed task object.
 */
export const taskTransformer = (task: Task): Task => {
  let transformedDeadline: Date | undefined;
  if (task.deadline) {
    const date = new Date(task.deadline);
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    transformedDeadline = new Date(year, month, day);
  }
  return {
    ...task,
    dateCreated: new Date(task.dateCreated),
    dateDeleted: task.dateDeleted ? new Date(task.dateDeleted) : undefined,
    deadline: task.deadline ? transformedDeadline : undefined
  };
};
