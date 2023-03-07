/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import { Autocomplete, Box, Link, TextField, Typography, useTheme } from '@mui/material';
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
import React, { useState } from 'react';
import { Project, Task, TaskPriority, TaskStatus, User, UserPreview } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useAuth } from '../../../hooks/auth.hooks';
import {
  useCreateTask,
  useDeleteTask,
  useEditTask,
  useEditTaskAssignees,
  useSetTaskStatus
} from '../../../hooks/tasks.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { fullNamePipe } from '../../../utils/pipes';
import { GridColDefStyle } from '../../../utils/tables';
import ErrorPage from '../../ErrorPage';
import TaskListNotesModal, { FormInput } from './TaskListNotesModal';

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
  project: Project;
  tasks: Task[];
  status: TaskStatus;
  addTask: boolean;
  onAddCancel: () => void;
}

type Row = {
  id: number;
  title: string;
  deadline: Date;
  priority: TaskPriority;
  assignees: UserPreview[];
  taskId: string;
  notes: string;
  task: Task;
};

function TitleEdit(params: GridRenderEditCellParams) {
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
}

const TaskListTabPanel = (props: TaskListTabPanelProps) => {
  const { value, index, tasks, status, addTask, onAddCancel, project } = props;
  const [modalShow, setModalShow] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const editTaskStatus = useSetTaskStatus();
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [priority, setPriority] = useState(TaskPriority.High);
  const [assignees, setAssignees] = useState<UserPreview[]>([]);
  const { mutateAsync: createTaskMutate } = useCreateTask(project.wbsNum);
  const { mutateAsync: deleteTaskMutate } = useDeleteTask();
  const { isLoading, isError, mutateAsync: editTaskMutateAsync, error } = useEditTask();
  const {
    isLoading: assigneeIsLoading,
    isError: assigneeIsError,
    mutateAsync: editTaskAssigneesMutateAsync,
    error: assigneeError
  } = useEditTaskAssignees();

  const toast = useToast();
  const auth = useAuth();
  const theme = useTheme();

  const team = project.team;

  const processRowUpdate = React.useCallback(
    async (newRow: GridRowModel) => {
      setTitle(newRow.title);
      setPriority(newRow.priority);
      setDeadline(newRow.deadline);
      return {
        id: newRow.id,
        title: newRow.title,
        deadline: newRow.deadline,
        priority: newRow.priority,
        assignees: assignees,
        taskId: newRow.tasId,
        notes: newRow.notes,
        task: newRow.task
      };
    },
    [assignees]
  );

  if (isLoading || assigneeIsLoading || !auth.user) return <LoadingIndicator />;
  if (!team)
    return (
      <>
        {value === index && (
          <Typography sx={{ py: '25px', textAlign: 'center' }}>
            A project can only have tasks if it is assigned to a team!
          </Typography>
        )}
      </>
    );
  if (isError) return <ErrorPage message={error?.message} />;
  if (assigneeIsError) return <ErrorPage message={assigneeError?.message} />;

  // can the user edit this task?
  const editTaskPermissions = (user: User | undefined, task: Task, proj: Project): boolean => {
    if (!user) return false;
    return (
      user.role === 'APP_ADMIN' ||
      user.role === 'ADMIN' ||
      user.role === 'LEADERSHIP' ||
      proj.projectLead?.userId === user.userId ||
      proj.projectManager?.userId === user.userId ||
      task.assignees.map((u) => u.userId).includes(user.userId) ||
      task.createdBy.userId === user.userId
    );
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

  const handleClose = () => {
    setModalShow(false);
    setSelectedTask(undefined);
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

  const transformDate = (date: Date) => {
    const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
    const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString();
    return `${date.getFullYear().toString()}/${month}/${day}`;
  };

  const renderAssigneeEdit = (params: GridRenderEditCellParams) => {
    return <AssigneeEdit {...params} />;
  };

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

  const createTask = async () => {
    await createTaskMutate({
      title: title,
      deadline: transformDate(deadline),
      priority: priority,
      status: status,
      assignees: assignees.map((user) => user.userId)
    })
      .finally(() => {
        toast.success('Task Successfully Created!');
        deleteCreateTask();
      })
      .catch((e) => toast.error(e.message, 6000));
  };

  const deleteCreateTask = () => {
    setTitle('');
    setDeadline(new Date());
    setPriority(TaskPriority.High);
    setAssignees([]);
    onAddCancel();
  };

  const getActions = (params: GridRowParams) => {
    const actions: JSX.Element[] = [];
    if (params.id === -1) {
      actions.push(<GridActionsCellItem icon={<SaveIcon fontSize="small" />} label="Save" onClick={createTask} />);
      actions.push(<GridActionsCellItem icon={<DeleteIcon fontSize="small" />} label="Delete" onClick={deleteCreateTask} />);
    } else {
      if (status === TaskStatus.DONE || status === TaskStatus.IN_BACKLOG) {
        actions.push(
          <GridActionsCellItem
            icon={<PlayArrowIcon fontSize="small" />}
            label="Move to In Progress"
            onClick={moveToInProgress(params.row.taskId)}
            showInMenu
            disabled={!editTaskPermissions(auth.user, params.row.task, project)}
          />
        );
      } else if (status === TaskStatus.IN_PROGRESS) {
        actions.push(
          <GridActionsCellItem
            icon={<PauseIcon fontSize="small" />}
            label="Move to Backlog"
            onClick={moveToBacklog(params.row.taskId)}
            showInMenu
            disabled={!editTaskPermissions(auth.user, params.row.task, project)}
          />
        );
        actions.push(
          <GridActionsCellItem
            icon={<CheckIcon fontSize="small" />}
            label="Move to Done"
            onClick={moveToDone(params.row.taskId)}
            showInMenu
            disabled={!editTaskPermissions(auth.user, params.row.task, project)}
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
          disabled={!editTaskPermissions(auth.user, params.row.task, project)}
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
            processRowUpdate={processRowUpdate}
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
        <TaskListNotesModal
          modalShow={modalShow}
          onHide={handleClose}
          onSubmit={handleEditTask}
          task={selectedTask!}
          team={team}
          hasEditPermissions={editTaskPermissions(auth.user, selectedTask!, project)}
        />
      )}
    </div>
  );
};

export default TaskListTabPanel;
