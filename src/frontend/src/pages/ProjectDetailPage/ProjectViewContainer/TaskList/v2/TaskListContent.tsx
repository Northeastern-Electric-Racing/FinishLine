import { DragDropContext, OnDragEndResponder, OnDragStartResponder } from '@hello-pangea/dnd';
import { Badge, Box, Button, TextField, Typography } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { FilterTaskArgs, Task, TaskStatus, TaskWithIndex, WbsNumber } from 'shared';
import { useQueryClient } from 'react-query';
import { getTasksByStatus, statuses, TasksByStatus } from '.';
import { useEditTask, useEditTaskAssignees, useFilterTasks, useSetTaskStatus } from '../../../../../hooks/tasks.hooks';
import { useToast } from '../../../../../hooks/toasts.hooks';
import { TaskColumn } from './TaskColumn';
import confetti from 'canvas-confetti';
import LoadingIndicator from '../../../../../components/LoadingIndicator';
import ErrorPage from '../../../../ErrorPage';
import NERModal from '../../../../../components/NERModal';
import TaskFormModal, { EditTaskFormInput } from '../TaskFormModal';
import TaskFilterBar, { TaskFilterContext } from '../../../../../components/TaskFilterBar';
import { TaskFilterFields, useTaskFilters } from '../../../../../hooks/task-filters.hooks';

interface TaskListContentProps {
  /** which task board this is; drives which filters appear and how tasks are scoped */
  context: TaskFilterContext;
  /** project/work package scope (also the base for created tasks). Absent on the global board. */
  wbsNum?: WbsNumber;
  /** global only: show the car dropdown (hidden when a global car is already selected) */
  showCarDropdown?: boolean;
  /** global only: car numbers forced by the global car selection, overriding the car filter */
  forcedCarNumbers?: number[];
  /** global only: constrain the create form's project picker to these car numbers */
  projectCarNumbers?: number[];
  /**
   * Controlled filter state. When provided (e.g. the global page owns the filters so its search box can
   * live in the page header), the search box is not rendered inline here. When omitted, the board keeps
   * its own ephemeral filter state and renders the search box beside the filters button.
   */
  filters?: TaskFilterFields;
  patch?: (partial: Partial<TaskFilterFields>) => void;
}

const nonEmpty = <T,>(arr: T[]): T[] | undefined => (arr.length > 0 ? arr : undefined);

// how many tasks each column renders initially, and how many more it reveals each time the user scrolls
// to the bottom — keeps a large global board from mounting hundreds of cards at once
const TASK_PAGE_SIZE = 20;

export const TaskListContent = ({
  context,
  wbsNum,
  showCarDropdown = false,
  forcedCarNumbers,
  projectCarNumbers,
  filters: externalFilters,
  patch: externalPatch
}: TaskListContentProps) => {
  const [showFilters, setShowFilters] = useState(context === 'global');

  const controlled = externalFilters !== undefined && externalPatch !== undefined;
  // only the uncontrolled board persists its own filters; when controlled the parent owns persistence
  const internal = useTaskFilters({
    persistKey: !controlled && context === 'global' ? 'globalTaskFilters' : undefined
  });
  const filters = externalFilters ?? internal.filters;
  const patch = externalPatch ?? internal.patch;

  const carNumbers = forcedCarNumbers ?? nonEmpty(filters.carNumbers);
  // NB: search is intentionally excluded — it's applied client-side over the loaded tasks (below) so
  // typing doesn't refetch the whole board on every keystroke
  const filterArgs: FilterTaskArgs = {
    ...(wbsNum ? { wbsNum } : {}),
    ...(carNumbers ? { carNumbers } : {}),
    ...(nonEmpty(filters.projectWbsNums) ? { projectWbsNums: filters.projectWbsNums } : {}),
    ...(nonEmpty(filters.workPackageWbsNums) ? { workPackageWbsNums: filters.workPackageWbsNums } : {}),
    ...(nonEmpty(filters.memberIds) ? { memberIds: filters.memberIds } : {}),
    ...(nonEmpty(filters.teamIds) ? { teamIds: filters.teamIds } : {}),
    ...(nonEmpty(filters.labelIds) ? { labelIds: filters.labelIds } : {}),
    andMemberTeam: true
  };

  const { data: tasks, isLoading, isError, error } = useFilterTasks(filterArgs);

  // fuzzy search runs over the tasks already loaded on the page (title + notes), so it's instant
  const searchLower = filters.search.trim().toLowerCase();
  const filteredTasks = useMemo(
    () =>
      (tasks ?? []).filter(
        (task) =>
          !searchLower ||
          task.title.toLowerCase().includes(searchLower) ||
          (task.notes ?? '').toLowerCase().includes(searchLower)
      ),
    [tasks, searchLower]
  );

  // number of active dropdown filters (each populated category counts once), shown on the filters button
  const appliedFilterCount = [
    filters.carNumbers,
    filters.projectWbsNums,
    filters.workPackageWbsNums,
    filters.memberIds,
    filters.teamIds,
    filters.labelIds
  ].filter((selection) => selection.length > 0).length;

  const [tasksByStatus, setTasksByStatus] = useState<TasksByStatus | undefined>(undefined); // can't use getTasksByStatus since tasks are async
  const { mutateAsync: setTaskStatus } = useSetTaskStatus();
  const { mutateAsync: editTask } = useEditTask();
  const { mutateAsync: editTaskAssignees } = useEditTaskAssignees();
  const queryClient = useQueryClient();

  // holds a pending move-to-done that still has incomplete blockers, awaiting user confirmation
  const [blockerConfirm, setBlockerConfirm] = useState<{ move: PendingMove; blockerNames: string[] } | null>(null);

  // holds a task dragged into In Progress without a deadline/assignee, so the user can fill them in
  const [fixTaskModal, setFixTaskModal] = useState<TaskWithIndex | null>(null);

  const toast = useToast();

  const [isDragging, setIsDragging] = useState(false);
  const [columnHeights, setColumnHeights] = useState<Partial<Record<TaskStatus, number>>>({});
  const equalizedHeight = Math.max(...(Object.values(columnHeights) as number[]));

  // incremental rendering: only the first `visibleCount` tasks of each column are mounted; the sentinel
  // rendered below the board grows this as it scrolls into view (see setSentinel)
  const [visibleCount, setVisibleCount] = useState(TASK_PAGE_SIZE);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const setSentinel = useCallback((node: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((count) => count + TASK_PAGE_SIZE);
      },
      { rootMargin: '400px' }
    );
    observerRef.current.observe(node);
  }, []);

  // (re)build the board whenever the loaded tasks or the client-side search change
  useEffect(() => {
    if (tasks) {
      setTasksByStatus(getTasksByStatus(filteredTasks));
      // start fresh when the tasks/filters/search change so a new view doesn't render everything at once
      setVisibleCount(TASK_PAGE_SIZE);
    }
  }, [tasks, filteredTasks]);

  const onHeightChange = useCallback((status: TaskStatus, height: number) => {
    setColumnHeights((prev) => ({ ...prev, [status]: height }));
  }, []);

  if (isError) return <ErrorPage error={error} />;
  if (isLoading || !tasksByStatus) return <LoadingIndicator />;

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

  // persists a move optimistically, firing confetti on completion and reverting on failure
  const applyMove = async (move: PendingMove) => {
    const { task, source, destination } = move;

    // compute local state change synchronously
    setTasksByStatus(updateTaskStatusLocal(task, source, destination, tasksByStatus));

    //trigger the mutation to persist the changes
    try {
      await setTaskStatus({ taskId: task.taskId, status: destination.status });
      const confettiPositions = [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9];
      if (destination.status === 'DONE' && source.status !== 'DONE') {
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
      setTasksByStatus(updateTaskStatusLocal(task, destination, source, tasksByStatus));
    }
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

    const move: PendingMove = {
      task: sourcePost,
      source: { status: sourceStatus, index: source.index },
      destination: { status: destinationStatus, index: destination.index }
    };

    // A task moving into In Progress must have a deadline and assignees. If it's missing either, open the
    // edit modal with those fields highlighted instead of failing the move, and let the user fill them in.
    if (destinationStatus === 'IN_PROGRESS' && sourceStatus !== 'IN_PROGRESS') {
      if (!sourcePost.deadline || sourcePost.assignees.length === 0) {
        setFixTaskModal(sourcePost);
        return;
      }
    }

    // If a task is being completed while it still has incomplete blockers, confirm with the user before
    // moving it rather than silently completing it. The blocker data already lives on the task itself.
    if (destinationStatus === 'DONE' && sourceStatus !== 'DONE') {
      const blockerNames = getIncompleteBlockerNames(sourcePost);
      if (blockerNames.length > 0) {
        setBlockerConfirm({ move, blockerNames });
        return;
      }
    }

    await applyMove(move);
  };

  const onConfirmCompleteBlockedTask = async () => {
    if (!blockerConfirm) return;
    const { move } = blockerConfirm;
    setBlockerConfirm(null);
    await applyMove(move);
  };

  // saves the deadline/assignees the user just filled in, then moves the task into In Progress
  const onFixTaskSubmit = async (data: EditTaskFormInput) => {
    if (!fixTaskModal) return;
    try {
      await editTask({
        taskId: data.taskId,
        notes: data.notes,
        title: data.title,
        deadline: data.deadline,
        startDate: data.startDate,
        priority: data.priority,
        labelIds: data.labels.map((label) => label.taskLabelId),
        blockedByIds: data.blockedBy.map((blocker) => blocker.taskId),
        wbsNum: data.wpWbsNum ?? fixTaskModal.wbsNum
      });
      await editTaskAssignees({ taskId: data.taskId, assignees: data.assignees });
      await setTaskStatus({ taskId: data.taskId, status: TaskStatus.IN_PROGRESS });
      // editTask/editTaskAssignees refetch tasks while the status is still the old one, so refetch once
      // more now that the status is In Progress to land the board on the correct final state
      await queryClient.invalidateQueries(['filter-tasks']);
      setFixTaskModal(null);
    } catch (error) {
      if (error instanceof Error) toast.error(error.message);
    }
  };

  const blockerCount = blockerConfirm?.blockerNames.length ?? 0;

  return (
    <>
      {fixTaskModal && (
        <TaskFormModal
          task={fixTaskModal}
          status={TaskStatus.IN_PROGRESS}
          validateOnOpen
          modalShow={!!fixTaskModal}
          onHide={() => setFixTaskModal(null)}
          onSubmit={onFixTaskSubmit}
          wbsNum={fixTaskModal.wbsNum}
          context={context}
        />
      )}
      <NERModal
        open={!!blockerConfirm}
        onHide={() => setBlockerConfirm(null)}
        onSubmit={onConfirmCompleteBlockedTask}
        title="Task is blocked"
        submitText="Yes"
        cancelText="No"
        showCloseButton
      >
        <Typography>
          The following {blockerCount === 1 ? 'task is' : 'tasks are'} supposed to block this task but{' '}
          {blockerCount === 1 ? 'is' : 'are'} not done yet:
        </Typography>
        <ul>
          {blockerConfirm?.blockerNames.map((name, idx) => (
            <li key={idx}>{name}</li>
          ))}
        </ul>
        <Typography>Are you sure this task is done?</Typography>
      </NERModal>
      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <Box display="flex" alignItems="center" mb={1} gap={1}>
          <Badge color="error" badgeContent={appliedFilterCount} invisible={showFilters || appliedFilterCount === 0}>
            <Button onClick={() => setShowFilters(!showFilters)} sx={{ height: '2.25rem' }}>
              <FilterListIcon fontSize="medium" />
              <Typography fontSize="0.75rem" align="center">
                Filters
              </Typography>
            </Button>
          </Badge>
          {/* search sits directly to the right of the filters button on every board */}
          <TextField
            size="small"
            placeholder="Search tasks"
            value={filters.search}
            onChange={(event) => patch({ search: event.target.value })}
            sx={{ minWidth: 240 }}
          />
        </Box>
        {/* kept mounted (just hidden) so the dropdowns fetch their options on page load, not on first open */}
        <Box sx={{ display: showFilters ? 'block' : 'none' }}>
          <TaskFilterBar
            context={context}
            filters={filters}
            patch={patch}
            showCarDropdown={showCarDropdown}
            scopeProjectWbsNum={context === 'project' ? wbsNum : undefined}
          />
        </Box>
        <Box display="flex">
          {statuses.map((status) => (
            <TaskColumn
              onAddTask={onAddTask}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
              onHeightChange={onHeightChange}
              status={status}
              tasks={tasksByStatus[status].slice(0, visibleCount)}
              key={status}
              wbsNum={wbsNum}
              context={context}
              projectCarNumbers={projectCarNumbers}
              equalizedHeight={equalizedHeight}
              isDragging={isDragging}
            />
          ))}
        </Box>
        {/* when any column still has tasks beyond what's rendered, this sentinel reveals another page as
            it scrolls near the viewport */}
        {visibleCount < Math.max(0, ...statuses.map((status) => tasksByStatus[status].length)) && (
          <div ref={setSentinel} style={{ height: 1 }} />
        )}
      </DragDropContext>
    </>
  );
};

interface PendingMove {
  task: TaskWithIndex;
  source: { status: Task['status']; index: number };
  destination: { status: Task['status']; index: number };
}

// The names of everything currently blocking a task from being completed: any incomplete blocking task
// plus any work package that still blocks this task's work package. Mirrors the backend's block check.
const getIncompleteBlockerNames = (task: Task): string[] => [
  ...task.blockedBy.filter((blocker) => blocker.status !== TaskStatus.DONE).map((blocker) => blocker.title),
  ...task.blockedByWorkPackages.map((workPackage) => workPackage.name)
];

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
