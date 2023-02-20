/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Link, useTheme } from '@mui/material';
import { DataGrid, GridActionsCellItem, GridColumns, GridRowId, GridRowParams } from '@mui/x-data-grid';
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

  const auth = useAuth();

  if (!auth.user) return <LoadingIndicator />;

  const disabled = auth.user.role === RoleEnum.GUEST;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme();

  const renderNotes = () => <Link>See Notes</Link>;

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
      flex: 1,
      align: 'center',
      headerAlign: 'center'
    };

    return [
      { ...baseColDef, field: 'title', headerName: 'Title', type: 'string', width: 90 },
      {
        ...baseColDef,
        field: 'notes',
        headerName: 'Notes',
        renderCell: renderNotes,
        width: 150
      },
      {
        ...baseColDef,
        field: 'deadline',
        headerName: 'Deadline',
        width: 150
      },
      {
        ...baseColDef,
        field: 'priority',
        headerName: 'Priority',
        width: 150
      },
      {
        ...baseColDef,
        field: 'assignee',
        headerName: 'Assignee',
        width: 150
      },
      {
        field: 'actions',
        type: 'actions',
        headerName: 'Actions',
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
        },
        width: 150
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
      assignee: assigneeString.substring(0, assigneeString.length - 2)
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
              '.MuiDataGrid-columnHeader--alignCenter': {
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
