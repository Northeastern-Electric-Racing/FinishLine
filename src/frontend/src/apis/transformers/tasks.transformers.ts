import { dbDateToLocalDate, Task, TaskLabel } from 'shared';

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
    startDate: task.startDate ? dbDateToLocalDate(new Date(task.startDate)) : undefined,
    labels: task.labels.map(taskLabelTransformer)
  };
};

/**
 * Transforms a task label to ensure deep field transformation of date objects.
 *
 * @param label Incoming task label object supplied by the HTTP response.
 * @returns Properly transformed task label object.
 */
export const taskLabelTransformer = (label: TaskLabel): TaskLabel => ({
  ...label,
  dateCreated: new Date(label.dateCreated),
  dateDeleted: label.dateDeleted ? new Date(label.dateDeleted) : undefined
});
