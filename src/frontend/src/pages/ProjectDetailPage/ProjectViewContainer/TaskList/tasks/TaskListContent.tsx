import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import { Box } from '@mui/material';
import { useEffect, useState } from 'react';
import { Project, Task } from 'shared';
import { getTasksByStatus, statuses, TasksByStatus } from '.';
import { useSetTaskStatus } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { TaskColumn } from './TaskColumn';

interface TaskListProps {
  project: Project;
}

const isEqual = (task1: Task, task2: Task) => {
  return task1.taskId === task2.taskId && task1.status === task2.status && task1.title === task2.title && task1.notes === task2.notes && task1.priority === task2.priority && task1.deadline === task2.deadline && task1.assignees === task2.assignees; 
}

export const TaskListContent = ({ project }: TaskListProps) => {
  const { tasks } = project;
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>(getTasksByStatus(tasks));
  const { mutateAsync: setTaskStatus, isLoading } = useSetTaskStatus();

  useEffect(() => {
    console.log(tasks);
    if (tasks.length !== tasksByStatus.DONE.length + tasksByStatus.IN_PROGRESS.length + tasksByStatus.IN_BACKLOG.length || tasks.some((task, index) => !isEqual(task, tasksByStatus[task.status][index]))){
      setTasksByStatus(getTasksByStatus(tasks));
    }
  }, [tasks, tasksByStatus]);
  const toast = useToast();

  if (isLoading) return null;

  const onDragEnd: OnDragEndResponder = async (result) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const sourceStatus = source.droppableId as Task['status'];
    const destinationStatus = destination.droppableId as Task['status'];
    const sourcePost = tasksByStatus[sourceStatus][source.index]!;

    // compute local state change synchronously
    setTasksByStatus(
      updateTaskStatusLocal(
        sourcePost,
        { status: sourceStatus, index: source.index },
        { status: destinationStatus, index: destination.index },
        tasksByStatus
      )
    );

    //trigger the mutation to persist the changes
    setTaskStatus({ taskId: sourcePost.taskId, status: destinationStatus }).catch((error) => {
      toast.error(error.message);
      setTasksByStatus(
        updateTaskStatusLocal(
          sourcePost,
          { status: destinationStatus, index: destination.index },
          { status: sourceStatus, index: source.index },
          tasksByStatus
        )
      );
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box display="flex">
        {statuses.map((status) => (
          <TaskColumn status={status} tasks={tasksByStatus[status]} key={status} project={project} />
        ))}
      </Box>
    </DragDropContext>
  );
};

const updateTaskStatusLocal = (
  sourceTask: Task,
  source: { status: Task['status']; index: number },
  destination: {
    status: Task['status'];
    index?: number; // undefined if dropped after the last item
  },
  tasksByStatus: TasksByStatus
) => {
  if (source.status === destination.status) {
    // moving deal inside the same column
    const column = tasksByStatus[source.status];
    column.splice(source.index, 1);
    column.splice(destination.index ?? column.length + 1, 0, sourceTask);
    return {
      ...tasksByStatus,
      [destination.status]: column
    };
  }
  // moving deal across columns
  const sourceColumn = tasksByStatus[source.status];
  const destinationColumn = tasksByStatus[destination.status];
  sourceColumn.splice(source.index, 1);
  destinationColumn.splice(destination.index ?? destinationColumn.length + 1, 0, sourceTask);
  return {
    ...tasksByStatus,
    [source.status]: sourceColumn,
    [destination.status]: destinationColumn
  };
};
