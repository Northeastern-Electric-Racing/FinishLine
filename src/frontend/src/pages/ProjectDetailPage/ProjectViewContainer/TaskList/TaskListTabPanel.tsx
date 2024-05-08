/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography } from '@mui/material';
import { Box } from '@mui/system';
import { useState } from 'react';
import { Task, TaskPriority, TaskStatus, UserPreview } from 'shared';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useAuth } from '../../../../hooks/auth.hooks';
import {
  useCreateTask,
  useDeleteTask,
  useEditTask,
  useEditTaskAssignees,
  useSetTaskStatus
} from '../../../../hooks/tasks.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { TaskListTabPanelProps, transformDate } from '../../../../utils/task.utils';
import ErrorPage from '../../../ErrorPage';
import TaskListDataGrid from './TaskListDataGrid';
import TaskListNotesModal, { FormInput } from './TaskListNotesModal';

const TaskListTabPanel = (props: TaskListTabPanelProps) => {
  const { tasks, status, addTask, onAddCancel, project, setDisabled } = props;
  const [modalShow, setModalShow] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const TABLE_ROW_COUNT = 'tl-table-row-count';
  const { isLoading, isError, mutateAsync: editTaskMutateAsync, error } = useEditTask();
  const { mutateAsync: createTaskMutate } = useCreateTask(project.wbsNum);
  const {
    isLoading: assigneeIsLoading,
    isError: assigneeIsError,
    mutateAsync: editTaskAssigneesMutateAsync,
    error: assigneeError
  } = useEditTaskAssignees();
  const { mutateAsync: deleteTaskMutate } = useDeleteTask();
  const editTaskStatus = useSetTaskStatus();

  const auth = useAuth();
  const toast = useToast();
  const { teams } = project;

  if (isLoading || assigneeIsLoading || !auth.user) return <LoadingIndicator />;
  if (teams.length === 0)
    return (
      <Typography sx={{ py: '25px', textAlign: 'center' }}>
        A project can only have tasks if it is assigned to a team!
      </Typography>
    );
  if (isError) return <ErrorPage message={error?.message} />;
  if (assigneeIsError) return <ErrorPage message={assigneeError?.message} />;
  if (!localStorage.getItem(TABLE_ROW_COUNT)) {
    localStorage.setItem(TABLE_ROW_COUNT, '25');
  }

  const moveToBacklog = (id: string) => async () => {
    try {
      await editTaskStatus.mutateAsync({ taskId: id, status: TaskStatus.IN_BACKLOG });
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  const moveToInProgress = (id: string) => async () => {
    try {
      await editTaskStatus.mutateAsync({ taskId: id, status: TaskStatus.IN_PROGRESS });
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  const moveToDone = (id: string) => async () => {
    try {
      await editTaskStatus.mutateAsync({ taskId: id, status: TaskStatus.DONE });
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  const deleteRow = (id: string) => async () => {
    try {
      await deleteTaskMutate({ taskId: id }).finally(() => toast.success('Task Successfully Deleted!'));
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  const createTask = async (title: string, deadline: Date, priority: TaskPriority, assignees: UserPreview[]) => {
    try {
      await createTaskMutate({
        title,
        deadline: transformDate(deadline),
        priority,
        status,
        assignees: assignees.map((user) => user.userId)
      });
      toast.success('Task Successfully Created!');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  // can the user edit this task?
  const editTaskPermissions = (task: Task): boolean => {
    if (!auth.user) return false;
    return (
      (auth.user.role === 'APP_ADMIN' ||
        auth.user.role === 'ADMIN' ||
        auth.user.role === 'LEADERSHIP' ||
        auth.user.role === 'HEAD' ||
        project.lead?.userId === auth.user.userId ||
        project.manager?.userId === auth.user.userId ||
        task.assignees.map((u) => u.userId).includes(auth.user.userId) ||
        task.createdBy.userId === auth.user.userId) ??
      false
    );
  };

  const handleClose = () => {
    setModalShow(false);
    setSelectedTask(undefined);
  };

  const handleEditTask = async ({ taskId, notes, title, deadline, assignees, priority }: FormInput) => {
    try {
      await editTaskMutateAsync({
        taskId,
        notes,
        title,
        deadline,
        priority
      });
      await editTaskAssigneesMutateAsync({
        taskId,
        assignees
      });
      toast.success('Task edited successfully!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
    handleClose();
  };

  // Skeleton copied from https://mui.com/material-ui/react-tabs/.
  // If they release the TabPanel component from @mui/lab to @mui/material then change the div to TabPanel.
  return (
    <Box flex={1}>
      <TaskListDataGrid
        teams={teams}
        status={status}
        tasks={tasks}
        editTaskPermissions={editTaskPermissions}
        tableRowCount={TABLE_ROW_COUNT}
        setSelectedTask={setSelectedTask}
        setModalShow={setModalShow}
        addTask={addTask}
        onAddCancel={onAddCancel}
        createTask={createTask}
        moveToBacklog={moveToBacklog}
        moveToDone={moveToDone}
        moveToInProgress={moveToInProgress}
        deleteRow={deleteRow}
        editTask={handleEditTask}
        setDisabled={setDisabled}
      />
      {modalShow && (
        <TaskListNotesModal
          modalShow={modalShow}
          onHide={handleClose}
          onSubmit={handleEditTask}
          task={selectedTask!}
          teams={teams}
          hasEditPermissions={editTaskPermissions(selectedTask!)}
        />
      )}
    </Box>
  );
};

export default TaskListTabPanel;
