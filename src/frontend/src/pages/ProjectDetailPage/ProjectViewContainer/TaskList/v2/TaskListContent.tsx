import { DragDropContext, OnDragEndResponder, OnDragStartResponder } from '@hello-pangea/dnd';
import { Box } from '@mui/material';
import { useCallback, useState, useEffect } from 'react';
import { Task, TaskStatus, TaskWithIndex, WbsNumber } from 'shared';
import { getTasksByStatus, statuses, TasksByStatus } from '.';
import { useSetTaskStatus, useTasksByWbsNum } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { TaskColumn } from './TaskColumn';
import confetti from 'canvas-confetti';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import ErrorPage from '../../../../ErrorPage';

interface TaskListContentProps {
  wbsNum: WbsNumber;
  wbsElementId: string;
}

export const TaskListContent = ({ wbsNum, wbsElementId }: TaskListContentProps) => {
  const { data: tasks, isLoading, isError, error } = useTasksByWbsNum(wbsNum);
  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus>(getTasksByStatus([])); // can't use getTasksByStatus since tasks are async
  const { mutateAsync: setTaskStatus } = useSetTaskStatus();

  const toast = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [columnHeights, setColumnHeights] = useState<Partial<Record<TaskStatus, number>>>({});
  const equalizedHeight = Math.max(...(Object.values(columnHeights) as number[]));

  // initialize tasksByStatus once tasks load, but only once
  useEffect(() => {
    if (tasks && !tasksByStatus) {
      setTasksByStatus(getTasksByStatus(tasks));
    }
  }, [tasks]);

  const onHeightChange = useCallback((status: TaskStatus, height: number) => {
    setColumnHeights((prev) => ({ ...prev, [status]: height }));
  }, []);

  if (isLoading || !tasks) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

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
    setTasksByStatus((prev) => ({
      ...prev,
      [task.status]: [...prev[task.status], { ...task, index: prev[task.status].length }]
    }));
  };

  const onDragStart: OnDragStartResponder = () => {
    setIsDragging(true);
  };

  const onDragEnd: OnDragEndResponder = async (result) => {
    setIsDragging(false);
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
    try {
      await setTaskStatus({ taskId: sourcePost.taskId, status: destinationStatus });
      const confettiPositions = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9];
      if (destinationStatus === 'DONE' && sourceStatus !== 'DONE') {
        confettiPositions.forEach((xPos) => {
          confetti({
            origin: { y: -0.5, x: xPos },
            angle: 270,
            gravity: 1.5,
            startVelocity: 35,
            spread: 70,
            particleCount: 25
          });
        });
      }
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
      //revert optimistic updates
      setTasksByStatus(
        updateTaskStatusLocal(
          sourcePost,
          { status: destinationStatus, index: destination.index },
          { status: sourceStatus, index: source.index },
          tasksByStatus
        )
      );
    }
  };

  return (
    <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
      <Box display="flex">
        {statuses.map((status) => (
          <TaskColumn
            onAddTask={onAddTask}
            onDeleteTask={onDeleteTask}
            onEditTask={onEditTask}
            onHeightChange={onHeightChange}
            status={status}
            tasks={tasksByStatus[status]}
            key={status}
            wbsNum={wbsNum}
            wbsElementId={wbsElementId}
            equalizedHeight={equalizedHeight}
            isDragging={isDragging}
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
