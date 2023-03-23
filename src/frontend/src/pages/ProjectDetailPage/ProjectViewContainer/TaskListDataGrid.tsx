import { Autocomplete, Link, TextField, Typography, useTheme } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridCellParams,
  GridColumns,
  GridRenderCellParams,
  GridRenderEditCellParams,
  GridRowModel,
  GridRowParams,
  useGridApiContext
} from '@mui/x-data-grid';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import { useState } from 'react';
import { Task, TaskPriority, TaskStatus, User, UserPreview } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { fullNamePipe } from '../../../utils/pipes';
import { GridColDefStyle } from '../../../utils/tables';
import { Row, TaskListDataGridProps } from '../../../utils/task.utils';
import React from 'react';

const TaskListDataGrid: React.FC<TaskListDataGridProps> = ({
  team,
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
  deleteRow
}) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [priority, setPriority] = useState(TaskPriority.High);
  const [assignees, setAssignees] = useState<UserPreview[]>([]);
  const [pageSize, setPageSize] = useState(Number(localStorage.getItem(tableRowCount)));
  const theme = useTheme();

  const TitleEdit = (params: GridRenderEditCellParams) => {
    const { id, value, field, setTitle } = params;
    const apiRef = useGridApiContext();

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value; // The new value entered by the user
      apiRef.current.setEditCellValue({ id, field, value: newValue });
      setTitle(newValue);
    };

    const handleRef = (element: HTMLDivElement) => {
      if (element) {
        const input = element.querySelector<HTMLInputElement>(`input[value="${value}"]`);
        input?.focus();
      }
    };

    return (
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Enter a title"
        value={value}
        onChange={handleValueChange}
        ref={handleRef}
      />
    );
  };

  const processRowUpdate = React.useCallback(async (newRow: GridRowModel) => {
    setTitle(newRow.title);
    setPriority(newRow.priority);
    setDeadline(newRow.deadline);
    return {
      id: newRow.id,
      title: newRow.title,
      deadline: newRow.deadline,
      priority: newRow.priority,
      assignees: newRow.assignees,
      taskId: newRow.taskId,
      notes: newRow.notes,
      task: newRow.task
    };
  }, []);

  const deleteCreateTask = () => {
    setTitle('');
    setDeadline(new Date());
    setPriority(TaskPriority.High);
    setAssignees([]);
    onAddCancel();
  };

  const renderNotes = (params: GridRenderCellParams<Task>) =>
    params.id === -1 ? (
      <Link color="#808080">See Notes</Link>
    ) : (
      <Link
        onClick={() => {
          setSelectedTask(params.row.task);
          setModalShow(true);
        }}
      >
        See Notes
      </Link>
    );

  const renderAssignees = (params: GridRenderCellParams) => {
    const assigneeString = params.row.assignees.reduce(
      (accumulator: string, currentVal: UserPreview) => accumulator + fullNamePipe(currentVal) + ', ',
      ''
    );
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

  function AssigneeEdit(params: GridRenderEditCellParams) {
    if (!team) return <LoadingIndicator />;

    const { value } = params;

    const userToAutocompleteOption = (user: User): { label: string; id: number } => {
      return { label: `${fullNamePipe(user)} (${user.email})`, id: user.userId };
    };

    const options = team.members
      .concat(team.leader)
      .sort((a, b) => (a.firstName > b.firstName ? 1 : -1))
      .map(userToAutocompleteOption);

    const handleValueChange = (
      _: any,
      newValue: {
        label: string;
        id: number;
      }[]
    ) => {
      const teamMembers = team.members.concat(team.leader);
      const users = newValue.map((user) => teamMembers.find((o) => o.userId === user.id)!);
      setAssignees(users);
    };

    const handleRef = (element: HTMLDivElement) => {
      if (element) {
        const input = element.querySelector<HTMLInputElement>(`input[value="${value}"]`);
        input?.focus();
      }
    };

    return (
      <Autocomplete
        fullWidth
        isOptionEqualToValue={(option, value) => option.id === value.id}
        filterSelectedOptions
        multiple
        id="tags-standard"
        options={options}
        getOptionLabel={(option) => option.label}
        onChange={handleValueChange}
        value={assignees.map((u: UserPreview) => options.find((o) => o.id === u.userId)!)}
        // TODO: make assignees an array with a custom method
        renderInput={(params) => <TextField {...params} variant="outlined" placeholder="Select A User" />}
        ref={handleRef}
      />
    );
  }

  const renderAssigneeEdit = (params: GridRenderEditCellParams) => {
    return <AssigneeEdit {...params} />;
  };

  const getActions = (params: GridRowParams) => {
    const actions: JSX.Element[] = [];
    if (params.id === -1) {
      actions.push(
        <GridActionsCellItem
          icon={<SaveIcon fontSize="small" />}
          label="Save"
          onClick={() => {
            createTask(title, deadline, priority, assignees)
            deleteCreateTask();
          }}
        />
      );
      actions.push(<GridActionsCellItem icon={<DeleteIcon fontSize="small" />} label="Delete" onClick={deleteCreateTask} />);
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
      flex: 1,
      field: 'notes',
      headerName: 'Notes',
      renderCell: renderNotes
    },
    {
      ...baseColDef,
      field: 'deadline',
      headerName: 'Deadline',
      type: 'date',
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
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 70,
      getActions
    }
  ];

  const rows = tasks.map((task: Task, idx: number) => {
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
  if (addTask) {
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
        wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 2 },
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

  const isCellEditable = (params: GridCellParams) => {
    return params.id === -1;
  };

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      isCellEditable={isCellEditable}
      experimentalFeatures={{ newEditingApi: true }}
      processRowUpdate={processRowUpdate}
      pageSize={pageSize}
      rowsPerPageOptions={[5, 10, 15, 100]}
      onPageSizeChange={(newPageSize) => {
        localStorage.setItem(tableRowCount, String(newPageSize));
        setPageSize(newPageSize);
      }}
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
  );
};

export default TaskListDataGrid;
