import { BaseTask, dbDateToLocalDate, Task, TaskBoardItem, TaskLabel } from 'shared';

/**
 * Transforms any task model that extends BaseTask, converting Base's date fields.
 *
 * @param task Incoming task object supplied by the HTTP response.
 * @returns Properly transformed task object.
 */
export const baseTaskTransformer = <T extends BaseTask>(task: T): T => ({
  ...task,
  deadline: task.deadline ? dbDateToLocalDate(new Date(task.deadline)) : undefined,
  labels: task.labels.map(taskLabelTransformer)
});

/**
 * Transforms a task board item (kanban boards and the calendar), converting the date fields it adds to Base.
 *
 * @param task Incoming task board item supplied by the HTTP response.
 * @returns Properly transformed task board item.
 */
export const taskBoardItemTransformer = (task: TaskBoardItem): TaskBoardItem => ({
  ...baseTaskTransformer(task),
  startDate: task.startDate ? dbDateToLocalDate(new Date(task.startDate)) : undefined
});

/**
 * Transforms a task to ensure deep field transformation of date objects.
 *
 * @deprecated Use baseTaskTransformer or a per-endpoint model's transformer. Still used by projects.transformers.ts until projects is refactored
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
export const taskLabelTransformer = (label: TaskLabel): TaskLabel => ({ ...label });
