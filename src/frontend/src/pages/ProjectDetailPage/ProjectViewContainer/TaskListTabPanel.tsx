/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, IconButton, Link, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridColumnHeaderParams } from '@mui/x-data-grid';
import { RoleEnum, Task, TaskStatus, UserPreview } from 'shared';
import { datePipe, userPreviewFullNamePipe } from '../../../utils/pipes';
import { GridColDefStyle } from '../../../utils/tables';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import PauseIcon from '@mui/icons-material/Pause';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckIcon from '@mui/icons-material/Check';
import { useAuth } from '../../../hooks/auth.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';

interface TaskListTabPanelProps {
  index: number;
  value: number;
  tasks: Task[];
  status: TaskStatus;
}

const TaskListTabPanel = (props: TaskListTabPanelProps) => {
  const { value, index, tasks, status } = props;
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const auth = useAuth();

  if (!auth.user) return <LoadingIndicator />;

  const disabled = auth.user.role === RoleEnum.GUEST;

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // Skeleton copied from https://mui.com/material-ui/react-tabs/.
  // If they release the TabPanel component from @mui/lab to @mui/material then change the div to TabPanel.

  const renderActionButtons = () => (
    <>
      <IconButton onClick={handleMenu}>
        <MenuIcon />
      </IconButton>
      <Menu
        id="task-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
        PaperProps={{
          style: {
            transform: 'translateX(-10%) translateY(35%)'
          }
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center'
        }}
        sx={{ minHeight: 0 }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete
        </MenuItem>
        {status === TaskStatus.IN_PROGRESS && (
          <MenuItem onClick={handleClose} disabled={disabled}>
            <ListItemIcon>
              <PauseIcon fontSize="small" />
            </ListItemIcon>
            Move to Backlog
          </MenuItem>
        )}
        {status !== TaskStatus.IN_PROGRESS && (
          <MenuItem onClick={handleClose} disabled={disabled}>
            <ListItemIcon>
              <PlayArrowIcon fontSize="small" />
            </ListItemIcon>
            Move to In Progress
          </MenuItem>
        )}
        {status === TaskStatus.IN_PROGRESS && (
          <MenuItem onClick={handleClose} disabled={disabled}>
            <ListItemIcon>
              <CheckIcon fontSize="small" />
            </ListItemIcon>
            Move to Done
          </MenuItem>
        )}
      </Menu>
    </>
  );

  const renderNotes = () => <Link>See Notes</Link>;

  const renderHeader = (params: GridColumnHeaderParams) => (
    <Typography sx={{ fontWeight: 'bold' }}>{params.colDef.headerName}</Typography>
  );

  const baseColDef: GridColDefStyle = {
    flex: 1,
    align: 'center',
    headerAlign: 'center'
  };

  const columns: GridColDef[] = [
    { ...baseColDef, field: 'title', headerName: 'Title', width: 90, renderHeader: renderHeader },
    {
      ...baseColDef,
      field: 'notes',
      headerName: 'Notes',
      renderCell: renderNotes,
      width: 150,
      renderHeader: renderHeader
    },
    {
      ...baseColDef,
      field: 'deadline',
      headerName: 'Deadline',
      width: 150,
      renderHeader: renderHeader
    },
    {
      ...baseColDef,
      field: 'priority',
      headerName: 'Priority',
      width: 150,
      renderHeader: renderHeader
    },
    {
      ...baseColDef,
      field: 'assignee',
      headerName: 'Assignee',
      width: 150,
      renderHeader: renderHeader
    },
    {
      ...baseColDef,
      field: 'actions',
      headerName: 'Actions',
      renderCell: renderActionButtons,
      width: 150,
      renderHeader: renderHeader
    }
  ];
  const rows = tasks.map((task: Task, idx: number) => {
    const date = new Date(task.deadline);
    const assigneeString = task.assignees.reduce(
      (accumulator: string, currentVal: UserPreview) => accumulator + userPreviewFullNamePipe(currentVal),
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
              '.MuiDataGrid-columnHeader--alignCenter': {
                borderBottom: 1
              }
            }}
          ></DataGrid>
        </Box>
      )}
    </div>
  );
};

export default TaskListTabPanel;
