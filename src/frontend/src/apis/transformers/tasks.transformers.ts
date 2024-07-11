import { Task } from 'shared';

/**
 * Transforms a task to ensure deep field transformation of date objects.
 *
 * @param task Incoming task object supplied by the HTTP response.
 * @returns Properly transformed task object.
 */
export const taskTransformer = (task: Task): Task => {
  return {
    ...task,
    dateCreated: new Date(task.dateCreated),
    dateDeleted: task.dateDeleted ? new Date(task.dateDeleted) : undefined,
    deadline: new Date(task.deadline)
  };
};
