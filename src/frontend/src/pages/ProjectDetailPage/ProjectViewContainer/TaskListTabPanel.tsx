/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, useTheme, Link } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColumns,
  GridRenderCellParams,
  GridRowId,
  GridRowParams
} from '@mui/x-data-grid';
import { RoleEnum, Task, TaskPriority, TaskStatus, UserPreview } from 'shared';
import { datePipe, fullNamePipe } from '../../../utils/pipes';
import { GridColDefStyle } from '../../../utils/tables';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import { useAuth } from '../../../hooks/auth.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import React from 'react';
import TaskListNotesModal, { FormInput } from './TaskListNotesModal';
import { useState } from 'react';
import { useEditTask } from '../../../hooks/tasks.hooks';
import ErrorPage from '../../ErrorPage';
import { useToast } from '../../../hooks/toasts.hooks';

//this is needed to fix some weird bug with getActions()
declare global {
  namespace React {
    interface DOMAttributes<T> {
      onResize?: ReactEventHandler<T> | undefined;
      onResizeCapture?: ReactEventHandler<T> | undefined;
      nonce?: string | undefined;
    }
  }
}

interface TaskListTabPanelProps {
  index: number;
  value: number;
  tasks: Task[];
  status: TaskStatus;
}

const TaskListTabPanel = (props: TaskListTabPanelProps) => {
  const { value, index, tasks, status } = props;
  const [modalShow, setModalShow] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const auth = useAuth();
  const { isLoading, isError, mutateAsync, error } = useEditTask();
  const toast = useToast();

  if (isLoading || !auth.user) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error?.message} />;

  const disabled = auth.user.role === RoleEnum.GUEST;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();

  const renderNotes = (params: GridRenderCellParams<Task>) => (
    <Link
      onClick={() => {
        setSelectedTask(params.row.task);
        setModalShow(true);
      }}
    >
      See Notes
    </Link>
  );

  const handleClose = () => {
    setModalShow(false);
    setSelectedTask(undefined);
  };

  const handleEditTask = async ({ taskId, notes, title, deadline, assignees, priority }: FormInput) => {
    handleClose();
    if (auth.user?.userId === undefined) throw new Error('Cannot edit a task while not being logged in');
    await mutateAsync({
      taskId,
      notes,
      title,
      deadline,
      priority,
      assignees
    }).catch((error) => {
      toast.error(error.message);
      throw new Error(error);
    });
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const moveToBacklog = React.useCallback(
    (id: GridRowId) => () => {
      console.log('move to backlog');
    },
    []
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const moveToInProgress = React.useCallback(
    (id: GridRowId) => () => {
      console.log('move to in progress');
    },
    []
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const moveToDone = React.useCallback(
    (id: GridRowId) => () => {
      console.log('move to done');
    },
    []
  );

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const deleteRow = React.useCallback(
    (id: GridRowId) => () => {
      console.log('move to done');
    },
    []
  );

  type Row = { id: number; title: string; deadline: string; priority: TaskPriority; assignee: string };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const columns = React.useMemo<GridColumns<Row>>(() => {
    const baseColDef: GridColDefStyle = {
      flex: 2,
      align: 'center',
      headerAlign: 'center'
    };

    return [
      { flex: 3, align: 'left', headerAlign: 'center', field: 'title', headerName: 'Title', type: 'string', width: 90 },
      {
        ...baseColDef,
        flex: 1,
        field: 'notes',
        headerName: 'Notes',
        renderCell: renderNotes
      },
      {
        ...baseColDef,
        field: 'deadline',
        headerName: 'Deadline'
      },
      {
        ...baseColDef,
        flex: 1,
        field: 'priority',
        headerName: 'Priority'
      },
      {
        flex: 3,
        field: 'assignee',
        headerName: 'Assignee',
        align: 'left',
        headerAlign: 'center'
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 70,
        getActions: (params: GridRowParams) => {
          const actions: JSX.Element[] = [];
          if (status === TaskStatus.DONE || status === TaskStatus.IN_BACKLOG) {
            actions.push(
              <GridActionsCellItem
                icon={<PlayArrowIcon fontSize="small" />}
                label="Move to In Progress"
                onClick={moveToInProgress(params.id)}
                showInMenu
                disabled={disabled}
              />
            );
          } else if (status === TaskStatus.IN_PROGRESS) {
            actions.push(
              <GridActionsCellItem
                icon={<PauseIcon fontSize="small" />}
                label="Move to Backlog"
                onClick={moveToBacklog(params.id)}
                showInMenu
                disabled={disabled}
              />
            );
            actions.push(
              <GridActionsCellItem
                icon={<CheckIcon fontSize="small" />}
                label="Move to Done"
                onClick={moveToDone(params.id)}
                showInMenu
                disabled={disabled}
              />
            );
          }
          actions.push(
            <GridActionsCellItem
              sx={{
                borderTop:
                  theme.palette.mode === 'light' ? '1px solid rgba(0, 0, 0, .2)' : '1px solid rgba(255, 255, 255, .2)'
              }}
              icon={<DeleteIcon fontSize="small" />}
              label="Delete"
              onClick={deleteRow(params.id)}
              showInMenu
              disabled
            />
          );
          return actions;
        }
      }
    ];
  }, [deleteRow, disabled, moveToBacklog, moveToDone, moveToInProgress, status, theme.palette.mode]);

  const rows = tasks.map((task: Task, idx: number) => {
    const date = new Date(task.deadline);
    const assigneeString = task.assignees.reduce(
      (accumulator: string, currentVal: UserPreview) => accumulator + fullNamePipe(currentVal) + ', ',
      ''
    );
    return {
      id: idx,
      title: task.title,
      deadline: datePipe(date),
      priority: task.priority,
      assignee: assigneeString.substring(0, assigneeString.length - 2),
      task: task
    };
  });

  // Skeleton copied from https://mui.com/material-ui/react-tabs/.
  // If they release the TabPanel component from @mui/lab to @mui/material then change the div to TabPanel.
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}>
      {value === index && (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            disableSelectionOnClick
            columns={columns}
            rows={rows}
            pageSize={5}
            rowsPerPageOptions={[5]}
            sx={{
              '&.MuiDataGrid-root .MuiDataGrid-cell:focus': {
                outline: 'none'
              },
              '.MuiDataGrid-columnSeparator': {
                display: 'none'
              },
              '.MuiDataGrid-cell': {
                borderBottom: 'none'
              },
              '&.MuiDataGrid-root': {
                border: 'none'
              },
              '.MuiDataGrid-cell:focus-within': {
                outline: 'none'
              },
              '.MuiDataGrid-columnHeader': {
                borderBottom: 1
              },
              '.MuiDataGrid-columnHeader:focus-within': {
                outline: 'none'
              }
            }}
          />
        </Box>
      )}
      {modalShow && (
        <TaskListNotesModal modalShow={modalShow} onHide={handleClose} onSubmit={handleEditTask} task={selectedTask!} />
      )}
    </div>
  );
};

export default TaskListTabPanel;
