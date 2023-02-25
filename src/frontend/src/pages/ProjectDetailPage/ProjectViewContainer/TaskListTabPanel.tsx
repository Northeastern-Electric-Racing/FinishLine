/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Link, Typography, useTheme } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridCellParams,
  GridColumns,
  GridRenderCellParams,
  GridRowId,
  GridRowParams
} from '@mui/x-data-grid';
import { RoleEnum, Task, TaskPriority, TaskStatus, UserPreview, WbsNumber } from 'shared';
import { datePipe, fullNamePipe } from '../../../utils/pipes';
import { GridColDefStyle } from '../../../utils/tables';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from '../../../hooks/auth.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import React from 'react';
import { useSetTaskStatus } from '../../../hooks/tasks.hooks';
import { useToast } from '../../../hooks/toasts.hooks';

//this is needed to fix some weird bug with getActions()
//see comment by michaldudak commented on Dec 5, 2022
//https://github.com/mui/material-ui/issues/35287
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
  addTask: boolean;
  onAddCancel: () => void;
  currentProject: WbsNumber;
}

type Row = {
  id: number;
  title: string;
  deadline: string;
  priority: TaskPriority;
  assignee: string;
  taskId: string;
  notes: string;
};

const TaskListTabPanel = (props: TaskListTabPanelProps) => {
  const { value, index, tasks, status, addTask, onAddCancel, currentProject } = props;
  const editTaskStatus = useSetTaskStatus();
  const toast = useToast();

  const auth = useAuth();

  const disabled = auth.user?.role === RoleEnum.GUEST;

  const theme = useTheme();

  const renderNotes = (params: GridRenderCellParams) =>
    params.id === -1 ? <Typography> {params.row.notes} </Typography> : <Link>See Notes</Link>;

  const renderPriority = (params: GridRenderCellParams) => {
    const { priority } = params.row;
    const color = priority === 'HIGH' ? '#ef4345' : priority === 'LOW' ? '#00ab41' : '#FFA500';
    return <Typography sx={{ color }}>{priority}</Typography>;
  };

  const moveToBacklog = React.useCallback(
    (id: string) => async () => {
      try {
        await editTaskStatus.mutateAsync({ taskId: id, status: TaskStatus.IN_BACKLOG });
      } catch (e: unknown) {
        console.log(e);
        if (e instanceof Error) {
          toast.error(e.message, 6000);
        }
      }
    },
    [editTaskStatus, toast]
  );

  const moveToInProgress = React.useCallback(
    (id: string) => async () => {
      try {
        await editTaskStatus.mutateAsync({ taskId: id, status: TaskStatus.IN_PROGRESS });
      } catch (e: unknown) {
        console.log(e);
        if (e instanceof Error) {
          toast.error(e.message, 6000);
        }
      }
    },
    [editTaskStatus, toast]
  );

  const moveToDone = React.useCallback(
    (id: string) => async () => {
      try {
        await editTaskStatus.mutateAsync({ taskId: id, status: TaskStatus.DONE });
      } catch (e: unknown) {
        console.log(e);
        if (e instanceof Error) {
          toast.error(e.message, 6000);
        }
      }
    },
    [editTaskStatus, toast]
  );

  const deleteRow = React.useCallback(
    (id: GridRowId) => () => {
      console.log('move to done');
    },
    []
  );

  const createTask = React.useCallback(
    (params: GridRowParams) => () => {
      console.log(currentProject);
      console.log(params);
      //plug in useCreateTask once you figure out all the edit stuff
    },
    [currentProject]
  );

  const deleteCreateTask = React.useCallback(
    () => () => {
      onAddCancel();
    },
    [onAddCancel]
  );

  const getActions = React.useCallback(
    (params: GridRowParams) => {
      const actions: JSX.Element[] = [];
      if (params.id === -1) {
        actions.push(<GridActionsCellItem icon={<SaveIcon fontSize="small" />} label="Save" onClick={createTask(params)} />);
        actions.push(
          <GridActionsCellItem icon={<DeleteIcon fontSize="small" />} label="Delete" onClick={deleteCreateTask()} />
        );
      } else {
        if (status === TaskStatus.DONE || status === TaskStatus.IN_BACKLOG) {
          actions.push(
            <GridActionsCellItem
              icon={<PlayArrowIcon fontSize="small" />}
              label="Move to In Progress"
              onClick={moveToInProgress(params.row.taskId)}
              showInMenu
              disabled={disabled}
            />
          );
        } else if (status === TaskStatus.IN_PROGRESS) {
          actions.push(
            <GridActionsCellItem
              icon={<PauseIcon fontSize="small" />}
              label="Move to Backlog"
              onClick={moveToBacklog(params.row.taskId)}
              showInMenu
              disabled={disabled}
            />
          );
          actions.push(
            <GridActionsCellItem
              icon={<CheckIcon fontSize="small" />}
              label="Move to Done"
              onClick={moveToDone(params.row.taskId)}
              showInMenu
              disabled={disabled}
            />
          );
        }
        actions.push(
          <GridActionsCellItem
            sx={{
              borderTop: theme.palette.mode === 'light' ? '1px solid rgba(0, 0, 0, .2)' : '1px solid rgba(255, 255, 255, .2)'
            }}
            icon={<DeleteIcon fontSize="small" />}
            label="Delete"
            onClick={deleteRow(params.id)}
            showInMenu
            disabled
          />
        );
      }
      return actions;
    },
    [
      createTask,
      deleteCreateTask,
      deleteRow,
      disabled,
      moveToBacklog,
      moveToDone,
      moveToInProgress,
      status,
      theme.palette.mode
    ]
  );

  const columns = React.useMemo<GridColumns<Row>>(() => {
    const baseColDef: GridColDefStyle = {
      flex: 2,
      align: 'center',
      headerAlign: 'center'
    };

    return [
      {
        flex: 3,
        align: 'left',
        headerAlign: 'center',
        field: 'title',
        headerName: 'Title',
        type: 'string',
        width: 90,
        editable: true
      },
      {
        ...baseColDef,
        flex: 1,
        field: 'notes',
        headerName: 'Notes',
        renderCell: renderNotes,
        editable: true
      },
      {
        ...baseColDef,
        field: 'deadline',
        headerName: 'Deadline',
        editable: true
      },
      {
        ...baseColDef,
        flex: 1,
        field: 'priority',
        headerName: 'Priority',
        renderCell: renderPriority,
        editable: true,
        type: 'singleSelect',
        valueOptions: ['HIGH', 'MEDIUM', 'LOW']
      },
      {
        flex: 3,
        field: 'assignee',
        headerName: 'Assignee',
        align: 'center',
        headerAlign: 'center',
        editable: true
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
        width: 70,
        getActions,
        editable: true
      }
    ];
  }, [getActions]);

  const rows = tasks.map((task: Task, idx: number) => {
    const assigneeString = task.assignees.reduce(
      (accumulator: string, currentVal: UserPreview) => accumulator + fullNamePipe(currentVal) + ', ',
      ''
    );
    return {
      id: idx,
      title: task.title,
      deadline: datePipe(task.deadline),
      priority: task.priority,
      assignee: assigneeString.substring(0, assigneeString.length - 2),
      taskId: task.taskId,
      notes: task.notes
    };
  });
  if (addTask) {
    rows.push({
      id: -1,
      title: '',
      deadline: new Date().toDateString(),
      priority: TaskPriority.High,
      assignee: '',
      taskId: '-1',
      notes: ''
    });
  }

  if (!auth.user) return <LoadingIndicator />;

  const isCellEditable = (params: GridCellParams) => {
    return params.id === -1;
  };

  // Skeleton copied from https://mui.com/material-ui/react-tabs/.
  // If they release the TabPanel component from @mui/lab to @mui/material then change the div to TabPanel.
  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}>
      {value === index && (
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            columns={columns}
            rows={rows}
            pageSize={5}
            isCellEditable={isCellEditable}
            experimentalFeatures={{ newEditingApi: true }}
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
    </div>
  );
};

export default TaskListTabPanel;
