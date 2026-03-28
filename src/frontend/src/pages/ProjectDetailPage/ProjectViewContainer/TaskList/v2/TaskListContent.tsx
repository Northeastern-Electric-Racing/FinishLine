import { DragDropContext, OnDragEndResponder, OnDragStartResponder } from '@hello-pangea/dnd';
import { Box } from '@mui/material';
import { useCallback, useState } from 'react';
import { Task, TaskStatus, TaskWithIndex, WbsNumber, WorkPackage } from 'shared';
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
  const [localTasks, setLocalTasks] = useState<Task[] | undefined>();
  const { mutateAsync: setTaskStatus } = useSetTaskStatus();

  const toast = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [columnHeights, setColumnHeights] = useState<Partial<Record<TaskStatus, number>>>({});
  const equalizedHeight = Math.max(...(Object.values(columnHeights) as number[]));

  const onHeightChange = useCallback((status: TaskStatus, height: number) => {
    setColumnHeights((prev) => ({ ...prev, [status]: height }));
  }, []);

  if (isLoading || !tasks) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const displayedTasks = localTasks ?? tasks;
  const tasksByStatus = getTasksByStatus(displayedTasks);

  const onDeleteTask = (taskId: string) => {
    setLocalTasks((prev) => (prev ?? tasks).filter((t) => t.taskId !== taskId));
  };

  const onEditTask = (task: Task) => {
    setLocalTasks((prev) => (prev ?? tasks).map((t) => (t.taskId === task.taskId ? task : t)));
  };

  const onAddTask = (task: Task) => {
    setLocalTasks((prev) => [...(prev ?? tasks), task]);
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
    const sourceTask = tasksByStatus[sourceStatus][source.index]!;

    // optimistically update local state
    setLocalTasks((prev) =>
      (prev ?? tasks).map((t) => (t.taskId === sourceTask.taskId ? { ...t, status: destinationStatus } : t))
    );

    try {
      await setTaskStatus({ taskId: sourceTask.taskId, status: destinationStatus });
      if (destinationStatus === 'DONE' && sourceStatus !== 'DONE') {
        const confettiPositions = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9];
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
      // revert optimistic update
      setLocalTasks((prev) =>
        (prev ?? tasks).map((t) => (t.taskId === sourceTask.taskId ? { ...t, status: sourceStatus } : t))
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
