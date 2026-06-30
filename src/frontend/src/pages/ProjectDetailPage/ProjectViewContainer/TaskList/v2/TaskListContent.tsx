import { DragDropContext, OnDragEndResponder, OnDragStartResponder } from '@hello-pangea/dnd';
import { Autocomplete, Box, Button, Chip, TextField, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useCallback, useState, useEffect } from 'react';
import { Task, TaskLabel, TaskStatus, TaskWithIndex, WbsNumber } from 'shared';
import { getTasksByStatus, statuses, TasksByStatus } from '.';
import { useAllTaskLabels, useFilterTasks, useSetTaskStatus } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { TaskColumn } from './TaskColumn';
import confetti from 'canvas-confetti';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import ErrorPage from '../../../../ErrorPage';

interface TaskListContentProps {
  wbsNum: WbsNumber;
}

export const TaskListContent = ({ wbsNum }: TaskListContentProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([]);

  const { data: tasks, isLoading, isError, error } = useFilterTasks({ wbsNum, labelIds: selectedLabelIds });
  const {
    data: taskLabels,
    isLoading: taskLabelsLoading,
    isError: tasklabelsIsError,
    error: tasksLabelsError
  } = useAllTaskLabels();

  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus | undefined>(undefined); // can't use getTasksByStatus since tasks are async
  const { mutateAsync: setTaskStatus } = useSetTaskStatus();

  const toast = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [columnHeights, setColumnHeights] = useState<Partial<Record<TaskStatus, number>>>({});
  const equalizedHeight = Math.max(...(Object.values(columnHeights) as number[]));

  // initialize tasksByStatus once tasks load, but only once
  useEffect(() => {
    if (tasks) {
      setTasksByStatus(getTasksByStatus(tasks));
    }
  }, [tasks]);

  const onHeightChange = useCallback((status: TaskStatus, height: number) => {
    setColumnHeights((prev) => ({ ...prev, [status]: height }));
  }, []);

  if (isError) return <ErrorPage error={error} />;
  if (tasklabelsIsError) return <ErrorPage error={tasksLabelsError} />;
  if (isLoading || taskLabelsLoading || !tasksByStatus) return <LoadingIndicator />;

  const onDeleteTask = (taskId: string) => {
    setTasksByStatus((prev) => {
      if (!prev) return prev;
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
      if (!prev) return prev;
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
      if (!prev) return prev;
      return {
        ...prev,
        [task.status]: [...prev[task.status], { ...task, index: prev[task.status].length }]
      };
    });
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
      <Box display="flex" alignItems="center" mb={1}>
        <Button onClick={() => setShowFilters(!showFilters)} sx={{ height: '2.25rem' }}>
          <FilterListIcon fontSize="medium" />
          <Typography fontSize="0.75rem" align="center">
            Filters
          </Typography>
        </Button>
      </Box>
      {showFilters && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Autocomplete
            multiple
            size="small"
            options={taskLabels ?? []}
            getOptionLabel={(option: TaskLabel) => option.name}
            isOptionEqualToValue={(option, val) => option.taskLabelId === val.taskLabelId}
            value={(taskLabels ?? []).filter((l) => selectedLabelIds.includes(l.taskLabelId))}
            onChange={(_, selected) => setSelectedLabelIds(selected.map((l) => l.taskLabelId))}
            renderOption={(props, option) => (
              <li {...props} key={option.taskLabelId}>
                <Box
                  sx={{
                    display: 'inline-block',
                    px: 1.5,
                    py: 0.25,
                    borderRadius: '999px',
                    backgroundColor: option.colorHexCode,
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.875rem'
                  }}
                >
                  {option.name}
                </Box>
              </li>
            )}
            renderTags={(selected, getTagProps) =>
              selected.map((label, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={label.taskLabelId}
                  label={label.name}
                  size="small"
                  sx={{
                    backgroundColor: label.colorHexCode,
                    color: 'white',
                    fontWeight: 500,
                    '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' }
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} variant="outlined" label="Labels" placeholder="Filter by label" />
            )}
            sx={{ width: '20%', minWidth: 200 }}
          />
        </Box>
      )}
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
