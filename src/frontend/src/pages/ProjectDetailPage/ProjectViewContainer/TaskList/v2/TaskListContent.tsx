import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import { Box } from '@mui/material';
import { useState } from 'react';
import { Project, Task, TaskWithIndex } from 'shared';
import { getTasksByStatus, statuses, TasksByStatus } from '.';
import { useSetTaskStatus } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { TaskColumn } from './TaskColumn';

interface TaskListProps {
  project: Project;
}

export const TaskListContent = ({ project }: TaskListProps) => {
  const { tasks } = project;
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>(getTasksByStatus(tasks));
  const { mutateAsync: setTaskStatus } = useSetTaskStatus();

  const toast = useToast();

  const onDeleteTask = (taskId: string) => {
    setTasksByStatus((prev) => {
      const newTasksByStatus = { ...prev };
      for (const status of statuses) {
        const index = newTasksByStatus[status].findIndex((task) => task?.taskId === taskId);
        if (index !== -1) {
          newTasksByStatus[status].splice(index, 1);
          break;
        }
      }
      return newTasksByStatus;
    });
  };

  const onEditTask = (task: Task) => {
    setTasksByStatus((prev) => {
      const newTasksByStatus = { ...prev };
      for (const status of statuses) {
        const index = newTasksByStatus[status].findIndex((t) => t?.taskId === task.taskId);
        if (index !== -1) {
          newTasksByStatus[status][index] = { ...task, index };
          break;
        }
      }
      return newTasksByStatus;
    });
  };

  const onAddTask = (task: Task) => {
    setTasksByStatus((prev) => {
      const newTasksByStatus = { ...prev };
      newTasksByStatus[task.status].push({ ...task, index: newTasksByStatus[task.status].length });
      return newTasksByStatus;
    });
  };

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
          <TaskColumn
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            status={status}
            tasks={tasksByStatus[status]}
            key={status}
            project={project}
          />
        ))}
      </Box>
    </DragDropContext>
  );
};

const updateTaskStatusLocal = (
  sourceTask: TaskWithIndex,
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
