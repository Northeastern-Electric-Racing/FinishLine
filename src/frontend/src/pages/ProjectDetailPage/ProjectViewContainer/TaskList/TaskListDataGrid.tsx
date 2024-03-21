/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Typography, useTheme } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridCellParams,
  GridColumns,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowId,
  GridRowParams
} from '@mui/x-data-grid';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionIcon from '@mui/icons-material/Description';
import { useState } from 'react';
import { Task, TaskPriority, TaskStatus, UserPreview } from 'shared';
import { fullNamePipe } from '../../../../utils/pipes';
import { GridColDefStyle } from '../../../../utils/tables';
import { Row, TaskListDataGridProps } from '../../../../utils/task.utils';
import React from 'react';
import { AssigneeEdit, DeadlineEdit, PriorityEdit, TitleEdit } from './TaskListComponents';
import { Cancel } from '@mui/icons-material';

const styles = {
  datagrid: {
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
  }
};

const TaskListDataGrid: React.FC<TaskListDataGridProps> = ({
  teams,
  tasks,
  editTaskPermissions,
  tableRowCount,
  setSelectedTask,
  setModalShow,
  createTask,
  status,
  addTask,
  onAddCancel,
  moveToInProgress,
  moveToBacklog,
  moveToDone,
  deleteRow,
  editTask,
  setDisabled
}) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [priority, setPriority] = useState(TaskPriority.High);
  const [assignees, setAssignees] = useState<UserPreview[]>([]);
  const [pageSize, setPageSize] = useState(Number(localStorage.getItem(tableRowCount)));
  const theme = useTheme();
  const [currentlyEditingId, setCurrentlyEditingId] = useState<GridRowId>(); //might have to change this

  const deleteCreateTask = () => {
    setTitle('');
    setDeadline(new Date());
    setPriority(TaskPriority.High);
    setAssignees([]);
    onAddCancel();
  };

  const renderAssignees = (params: GridRenderCellParams) => {
    let assigneeString = '';
    if (assignees.length > 0 && (params.row.id === -1 || params.row.id === currentlyEditingId)) {
      assigneeString = assignees.reduce(
        (accumulator: string, currentVal: UserPreview) => accumulator + fullNamePipe(currentVal) + ', ',
        ''
      );
    } else {
      assigneeString = params.row.assignees.reduce(
        (accumulator: string, currentVal: UserPreview) => accumulator + fullNamePipe(currentVal) + ', ',
        ''
      );
    }
    return <Typography>{assigneeString.substring(0, assigneeString.length - 2)}</Typography>;
  };

  const renderPriority = (params: GridRenderCellParams) => {
    const { priority } = params.row;
    const color = priority === 'HIGH' ? '#ef4345' : priority === 'LOW' ? '#00ab41' : '#FFA500';
    return <Typography sx={{ color }}>{priority}</Typography>;
  };

  const renderTitleEdit = (params: GridRenderEditCellParams) => {
    return <TitleEdit {...params} setTitle={setTitle} />;
  };

  const renderAssigneeEdit = (params: GridRenderEditCellParams) => {
    return <AssigneeEdit {...params} teams={teams} assignees={assignees} setAssignees={setAssignees} />;
  };

  const renderEditPriority = (params: GridRenderEditCellParams) => {
    return <PriorityEdit {...params} priority={priority} setPriority={setPriority} />;
  };

  const renderEditDeadline = (params: GridRenderEditCellParams) => {
    return <DeadlineEdit {...params} deadline={deadline} setDeadline={setDeadline} />;
  };

  const getActions = (params: GridRowParams) => {
    const actions: JSX.Element[] = [];
    if (params.id === -1) {
      actions.push(
        <GridActionsCellItem
          icon={<SaveIcon fontSize="small" />}
          label="Save"
          onClick={() => {
            createTask(title, deadline, priority, assignees);
            deleteCreateTask();
          }}
        />
      );
      actions.push(<GridActionsCellItem icon={<DeleteIcon fontSize="small" />} label="Delete" onClick={deleteCreateTask} />);
    } else {
      if (params.id === currentlyEditingId) {
        actions.push(
          <GridActionsCellItem
            icon={<SaveIcon fontSize="small" />}
            label="Save"
            onClick={() => {
              editTask({
                taskId: params.row.taskId,
                notes: params.row.notes,
                title: title,
                deadline: deadline,
                assignees: assignees.map((assignee: UserPreview) => assignee.userId),
                priority: priority
              });
              setDisabled(false);
              setTitle('');
              setDeadline(new Date());
              setPriority(TaskPriority.High);
              setAssignees([]);
            }}
          />
        );
        actions.push(
          <GridActionsCellItem
            icon={<Cancel fontSize="small" />}
            label="cancel"
            onClick={() => {
              setDisabled(false);
              setCurrentlyEditingId(undefined);
              setTitle('');
              setDeadline(new Date());
              setPriority(TaskPriority.High);
              setAssignees([]);
            }}
          />
        );
      } else {
        if (status === TaskStatus.DONE || status === TaskStatus.IN_BACKLOG) {
          actions.push(
            <GridActionsCellItem
              icon={<PlayArrowIcon fontSize="small" />}
              label="Move to In Progress"
              onClick={moveToInProgress(params.row.taskId)}
              showInMenu
              disabled={!editTaskPermissions(params.row.task)}
            />
          );
        } else if (status === TaskStatus.IN_PROGRESS) {
          actions.push(
            <GridActionsCellItem
              icon={<PauseIcon fontSize="small" />}
              label="Move to Backlog"
              onClick={moveToBacklog(params.row.taskId)}
              showInMenu
              disabled={!editTaskPermissions(params.row.task)}
            />
          );
          actions.push(
            <GridActionsCellItem
              icon={<CheckIcon fontSize="small" />}
              label="Move to Done"
              onClick={moveToDone(params.row.taskId)}
              showInMenu
              disabled={!editTaskPermissions(params.row.task)}
            />
          );
        }
        actions.push(
          <GridActionsCellItem
            icon={<EditIcon fontSize="small" />}
            label="Edit"
            showInMenu
            disabled={!editTaskPermissions(params.row.task) || addTask}
            onClick={() => {
              setTitle(params.row.title);
              setDeadline(params.row.deadline);
              setPriority(params.row.priority);
              setAssignees(params.row.assignees);
              setCurrentlyEditingId(params.id);
              setDisabled(true);
            }}
          />
        );
        actions.push(
          <GridActionsCellItem
            sx={{
              borderTop: theme.palette.mode === 'light' ? '1px solid rgba(0, 0, 0, .2)' : '1px solid rgba(255, 255, 255, .2)'
            }}
            icon={<DeleteIcon fontSize="small" />}
            label="Delete"
            onClick={deleteRow(params.row.taskId)}
            showInMenu
            disabled={!editTaskPermissions(params.row.task)}
          />
        );
        actions.push(
          <GridActionsCellItem
            icon={<DescriptionIcon fontSize="small" />}
            label="notes"
            onClick={() => {
              setSelectedTask(params.row.task);
              setModalShow(true);
            }}
          />
        );
      }
    }
    return actions;
  };

  const baseColDef: GridColDefStyle = {
    flex: 2,
    align: 'center',
    headerAlign: 'center'
  };

  const columns: GridColumns<Row> = [
    {
      flex: 3,
      align: 'left',
      headerAlign: 'center',
      field: 'title',
      headerName: 'Title',
      type: 'string',
      width: 90,
      renderEditCell: renderTitleEdit,
      editable: true
    },
    {
      ...baseColDef,
      field: 'deadline',
      headerName: 'Deadline',
      renderEditCell: renderEditDeadline,
      type: 'date',
      editable: true
    },
    {
      ...baseColDef,
      flex: 1,
      field: 'priority',
      headerName: 'Priority',
      renderCell: renderPriority,
      renderEditCell: renderEditPriority,
      editable: true,
      type: 'singleSelect',
      valueOptions: [TaskPriority.High, TaskPriority.Medium, TaskPriority.Low]
    },
    {
      flex: 3,
      field: 'assignees',
      headerName: 'Assignee',
      align: 'center',
      headerAlign: 'center',
      renderEditCell: renderAssigneeEdit,
      renderCell: renderAssignees,
      editable: true
    },
    {
      flex: 1,
      field: 'actions',
      type: 'actions',
      width: 70,
      getActions
    }
  ];

  let rows = tasks.map((task: Task, idx: number) => {
    return {
      id: idx,
      title: task.title,
      deadline: task.deadline,
      priority: task.priority,
      assignees: task.assignees,
      notes: task.notes,
      taskId: task.taskId,
      task: task
    };
  });

  if (addTask && currentlyEditingId === undefined) {
    rows.unshift({
      id: -1,
      title: title,
      deadline: deadline,
      priority: priority,
      assignees: assignees,
      taskId: '-1',
      notes: '',
      task: {
        taskId: '',
        wbsNum: { carNumber: 0, projectNumber: 0, workPackageNumber: 0 },
        title: '',
        notes: '',
        dateCreated: new Date(),
        createdBy: { userId: 0, firstName: '', lastName: '', email: '', role: 'GUEST' },
        assignees: [],
        deadline: new Date(),
        priority: TaskPriority.High,
        status: TaskStatus.DONE
      }
    });
  }
  if (currentlyEditingId !== undefined && !addTask) {
    rows = rows.map((row) => {
      if (row.id === currentlyEditingId) {
        return {
          id: row.id,
          title: title,
          deadline: deadline,
          priority: priority,
          assignees: assignees,
          taskId: row.taskId,
          notes: row.notes,
          task: row.task
        };
      } else {
        return row;
      }
    });
  }

  const isCellEditable = (params: GridCellParams) => {
    return params.id === -1 || params.id === currentlyEditingId;
  };

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      experimentalFeatures={{ newEditingApi: true }}
      isCellEditable={isCellEditable}
      pageSize={pageSize}
      rowsPerPageOptions={[5, 10, 15, 25, 100]}
      onPageSizeChange={(newPageSize) => {
        localStorage.setItem(tableRowCount, String(newPageSize));
        setPageSize(newPageSize);
      }}
      sx={styles.datagrid}
      autoHeight={true}
    />
  );
};

export default TaskListDataGrid;
