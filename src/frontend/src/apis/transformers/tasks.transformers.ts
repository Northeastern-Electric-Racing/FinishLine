import { dbDateToLocalDate, Task } from 'shared';

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
    deadline: task.deadline ? dbDateToLocalDate(new Date(task.deadline)) : undefined,
    startDate: task.startDate ? dbDateToLocalDate(new Date(task.startDate)) : undefined
  };
};
