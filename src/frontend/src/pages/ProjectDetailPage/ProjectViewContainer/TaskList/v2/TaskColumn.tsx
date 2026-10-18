import { Droppable } from '@hello-pangea/dnd';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { TaskBoardItem, TaskStatus, TaskWithIndex, WbsNumber } from 'shared';
import { statusNames, TaskCard } from '.';
import { NERButton } from '../../../../../components/NERButton';
import { useCreateTask } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { toDateString } from 'shared';
import TaskFormModal, { EditTaskFormInput } from '../TaskFormModal';

export const TaskColumn = ({
  status,
  tasks,
  wbsNum,
  context,
  projectCarNumbers,
  equalizedHeight,
  isDragging,
  onEditTask,
  onDeleteTask,
  onAddTask,
  onHeightChange,
  hasMore = false,
  onLoadMore
}: {
  status: TaskStatus;
  tasks: TaskWithIndex[];
  wbsNum?: WbsNumber;
  context?: 'global' | 'project' | 'workPackage';
  projectCarNumbers?: number[];
  equalizedHeight: number;
  isDragging: boolean;
  onEditTask: (task: TaskBoardItem) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTask: (task: TaskBoardItem) => void;
  onHeightChange: (status: TaskStatus, height: number) => void;
  /** whether this column has more tasks still to load (from the server, or not yet rendered); shows a spinner below it */
  hasMore?: boolean;
  /** paginated (global) board: loads the column's next page. Other boards reveal more with one sentinel below the board */
  onLoadMore?: () => void;
}) => {
  const { mutateAsync: createTask, isLoading } = useCreateTask();
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const toast = useToast();
  const theme = useTheme();
  const droppableBoxRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const box = droppableBoxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() => {
      onHeightChange(status, box.scrollHeight);
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [status, onHeightChange]);

  const handleCreateTask = async ({
    notes,
    title,
    deadline,
    assignees,
    labels,
    blockedBy,
    priority,
    startDate,
    wpWbsNum,
    projectWbsNum
  }: EditTaskFormInput) => {
    // work package wins, then the chosen project (global create), then the board's own scope
    const createWbsNum = wpWbsNum ?? projectWbsNum ?? wbsNum;
    if (!createWbsNum) {
      toast.error('Please select a project for this task.');
      return;
    }
    try {
      const task = await createTask({
        wbsNum: createWbsNum,
        title,
        deadline: deadline ? toDateString(deadline) : undefined,
        startDate: startDate ? toDateString(startDate) : undefined,
        priority,
        status: status as TaskStatus,
        assignees,
        notes,
        labelIds: labels.map((l) => l.taskLabelId),
        blockedByIds: blockedBy.map((b) => b.taskId)
      });
      onAddTask(task);
      toast.success('Task Successfully Created!');
      setShowCreateTaskModal(false);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  return (
    <>
      <TaskFormModal
        status={status}
        onSubmit={handleCreateTask}
        onHide={() => setShowCreateTaskModal(false)}
        modalShow={showCreateTaskModal}
        wbsNum={wbsNum}
        context={context}
        projectCarNumbers={projectCarNumbers}
        isLoading={isLoading}
      />
      <Box
        sx={{
          flex: 1,
          // without an explicit basis + min-width:0, a column whose cards have wider content (common on
          // the global board, which spans many projects) won't shrink and ends up wider than the others
          flexBasis: 0,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: '8px',
          paddingBottom: '16px',
          backgroundColor: theme.palette.background.paper,
          marginLeft: '5px',
          borderRadius: '5px',
          minHeight: isDragging ? `${equalizedHeight}px` : undefined
        }}
      >
        <Typography align="center" variant="h5">
          {statusNames[status]}
        </Typography>
        <NERButton
          sx={{
            marginTop: '5px',
            backgroundColor: theme.palette.secondary.contrastText,
            width: 'calc(100% - 10px)',
            marginX: '5px'
          }}
          onClick={() => setShowCreateTaskModal(true)}
        >
          + Add A Task
        </NERButton>
        <Droppable droppableId={status}>
          {(droppableProvided, snapshot) => (
            <Box
              ref={(droppableBox: HTMLElement | null) => {
                droppableProvided.innerRef(droppableBox);
                droppableBoxRef.current = droppableBox;
              }}
              {...droppableProvided.droppableProps}
              className={snapshot.isDraggingOver ? ' isDraggingOver' : ''}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 5,
                padding: '5px',
                flex: 1,
                '&.isDraggingOver': {
                  bgcolor: '#dadadf'
                }
              }}
            >
              {tasks.map((task, index) => (
                <TaskCard
                  onDeleteTask={onDeleteTask}
                  onEditTask={onEditTask}
                  key={task.taskId}
                  task={task}
                  index={index}
                  wbsNum={wbsNum}
                  context={context}
                  showProjectName={context === 'global'}
                />
              ))}
              {droppableProvided.placeholder}
            </Box>
          )}
        </Droppable>
        {hasMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '8px' }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {hasMore && onLoadMore && <LoadMoreSentinel onVisible={onLoadMore} />}
      </Box>
    </>
  );
};

// Sits at the bottom of a paginated column and loads more whenever it's near the viewport. It re-observes on every
// render, so a column that's still short after a page arrives keeps asking until it fills the screen or runs out
const LoadMoreSentinel = ({ onVisible }: { onVisible: () => void }) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onVisible();
      },
      { rootMargin: '400px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [onVisible]);

  return <div ref={sentinelRef} style={{ height: 1 }} />;
};
