/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Link, Typography, useTheme } from '@mui/material';
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
  deleteRow,
  editTask
}) => {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(new Date());
  const [priority, setPriority] = useState(TaskPriority.High);
  const [assignees, setAssignees] = useState<UserPreview[]>([]);
  const [pageSize, setPageSize] = useState(Number(localStorage.getItem(tableRowCount)));
  const theme = useTheme();
  let [currentlyEditingId, setCurrentlyEditingId] = useState<GridRowId>(); //might have to change this

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
    return <AssigneeEdit {...params} team={team} assignees={assignees} setAssignees={setAssignees} />;
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
            disabled={!editTaskPermissions(params.row.task)}
            onClick={() => {
              console.log('test');
              setTitle(params.row.title);
              setDeadline(params.row.deadline);
              setPriority(params.row.priority);
              setAssignees(params.row.assignees);
              setCurrentlyEditingId(params.id);
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
      flex: 1,
      field: 'notes',
      headerName: 'Notes',
      renderCell: renderNotes
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
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
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
  if (currentlyEditingId !== undefined) {
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
      rowsPerPageOptions={[5, 10, 15, 100]}
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

// import * as React from 'react';
// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import AddIcon from '@mui/icons-material/Add';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/DeleteOutlined';
// import SaveIcon from '@mui/icons-material/Save';
// import CancelIcon from '@mui/icons-material/Close';
// import {
//   GridRowsProp,
//   GridRowModesModel,
//   GridRowModes,
//   GridColDef,
//   GridRowParams,
//   MuiEvent,
//   GridToolbarContainer,
//   GridActionsCellItem,
//   GridEventListener,
//   GridRowId,
//   DataGrid,
//   GridColumns
// } from '@mui/x-data-grid';
// import { Task } from 'shared';

// interface EditToolbarProps {
//   setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
//   setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
// }

// function EditToolbar(props: EditToolbarProps) {
//   const { setRows, setRowModesModel } = props;

//   const handleClick = () => {
//     const id = 10;
//     setRows((oldRows) => [...oldRows, { id, name: '', age: '', isNew: true }]);
//     setRowModesModel((oldModel) => ({
//       ...oldModel,
//       [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' }
//     }));
//   };

//   return (
//     <GridToolbarContainer>
//       <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
//         Add record
//       </Button>
//     </GridToolbarContainer>
//   );
// }

// const TaskListDataGrid: React.FC<TaskListDataGridProps> = ({ tasks }) => {
//   const [rows, setRows] = React.useState<Row[]>(
//     tasks.map((task: Task, idx: number) => {
//       return {
//         id: idx,
//         title: task.title,
//         deadline: task.deadline,
//         priority: task.priority,
//         assignees: task.assignees,
//         notes: task.notes,
//         taskId: task.taskId,
//         task: task,
//         isNew: false
//       };
//     }));
//   const [rowModesModel, setRowModesModel] = React.useState<GridRowModesModel>({});

//   const handleRowEditStart = (params: GridRowParams, event: MuiEvent<React.SyntheticEvent>) => {
//     console.log("tests")
//     event.defaultMuiPrevented = true;
//   };

//   const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
//     event.defaultMuiPrevented = true;
//   };

//   const handleEditClick = (id: GridRowId) => () => {
//     setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
//   };

//   const handleSaveClick = (id: GridRowId) => () => {
//     setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
//   };

//   const handleDeleteClick = (id: GridRowId) => () => {
//     setRows(rows.filter((row) => row.id !== id));
//   };

//   const handleCancelClick = (id: GridRowId) => () => {
//     setRowModesModel({
//       ...rowModesModel,
//       [id]: { mode: GridRowModes.View, ignoreModifications: true }
//     });

//     const editedRow = rows.find((row) => row.id === id);
//     if (editedRow!.isNew) {
//       setRows(rows.filter((row) => row.id !== id));
//     }
//   };

//   const processRowUpdate = (newRow: Row) => {
//     const updatedRow = { ...newRow, isNew: false };
//     setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
//     return updatedRow;
//   };

//   const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
//     setRowModesModel(newRowModesModel);
//   };

//   const columns: GridColumns<Row> = [
//     { field: 'title', headerName: 'Name', width: 180, editable: true },
//     { field: 'age', headerName: 'Age', type: 'number', editable: true },
//     {
//       field: 'deadline',
//       headerName: 'Date Created',
//       type: 'date',
//       width: 180,
//       editable: true
//     },
//     {
//       field: 'priority',
//       headerName: 'Priority',
//       type: 'select',
//       width: 220,
//       editable: true
//     },
//     {
//       field: 'actions',
//       type: 'actions',
//       headerName: 'Actions',
//       width: 100,
//       cellClassName: 'actions',
//       getActions: ({ id }) => {
//         const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
//         if (isInEditMode) {
//           return [
//             <GridActionsCellItem icon={<SaveIcon />} label="Save" onClick={handleSaveClick(id)} />,
//             <GridActionsCellItem
//               icon={<CancelIcon />}
//               label="Cancel"
//               className="textPrimary"
//               onClick={handleCancelClick(id)}
//               color="inherit"
//             />
//           ];
//         }

//         return [
//           <GridActionsCellItem
//             icon={<EditIcon />}
//             label="Edit"
//             className="textPrimary"
//             onClick={handleEditClick(id)}
//             color="inherit"
//           />,
//           <GridActionsCellItem icon={<DeleteIcon />} label="Delete" onClick={handleDeleteClick(id)} color="inherit" />
//         ];
//       }
//     }
//   ];

//   return (
//     <Box
//       sx={{
//         height: 500,
//         width: '100%',
//         '& .actions': {
//           color: 'text.secondary'
//         },
//         '& .textPrimary': {
//           color: 'text.primary'
//         }
//       }}
//     >
//       <DataGrid
//         rows={rows}
//         columns={columns}
//         editMode="row"
//         rowModesModel={rowModesModel}
//         onRowModesModelChange={handleRowModesModelChange}
//         onRowEditStart={handleRowEditStart}
//         onRowEditStop={handleRowEditStop}
//         processRowUpdate={processRowUpdate}
//       />
//     </Box>
//   );
// };

// export default TaskListDataGrid;
