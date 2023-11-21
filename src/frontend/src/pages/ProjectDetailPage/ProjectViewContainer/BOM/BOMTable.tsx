import { Box } from '@mui/system';
import { DataGrid, GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid';
import { useState } from 'react';
import { MaterialStatus, Project, isLeadership } from 'shared';
import { GridColDefStyle } from '../../../../utils/tables';
import { materialToRow } from '../../../../utils/bom.utils';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import { useCurrentUser } from '../../../../hooks/users.hooks';

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

const baseColDef: GridColDefStyle = {
  flex: 1,
  align: 'center',
  headerAlign: 'center',
  headerClassName: 'super-app-theme--header'
};

const BOMTable = ({ project, tableRowCount }: { project: Project; tableRowCount: string }) => {
  const [pageSize, setPageSize] = useState(Number(localStorage.getItem(tableRowCount)));
  const user = useCurrentUser();
  const editPerms =
    isLeadership(user.role) ||
    project.teams.some((team) => team.head.userId === user.userId) ||
    project.teams.some((team) => team.leads.map((lead) => lead.userId).includes(user.userId)) ||
    project.teams.some((team) => team.members.map((member) => member.userId).includes(user.userId));

  const { assemblies, materials } = project;

  const getActions = (params: GridRowParams) => {
    const actions: JSX.Element[] = [];
    actions.push(
      <GridActionsCellItem icon={<DeleteIcon fontSize="small" />} label="Delete" showInMenu onClick={() => {}} />
    );
    actions.push(
      <GridActionsCellItem
        icon={<EditIcon fontSize="small" />}
        label="Edit"
        showInMenu
        disabled={!editPerms}
        onClick={() => {}}
      />
    );
    assemblies.forEach((assembly) =>
      actions.push(
        <GridActionsCellItem
          icon={<MoveToInboxIcon fontSize="small" />}
          label={`Switch to Assembly: ${assembly.name}`}
          showInMenu
          disabled={true}
          onClick={() => {}}
        />
      )
    );
    return actions;
  };

  const columns: GridColumns<any> = [
    {
      ...baseColDef,
      flex: 2,
      field: 'status',
      headerName: 'Status',
      type: 'singleSelect',
      valueOptions: [MaterialStatus.Ordered, MaterialStatus.Received, MaterialStatus.Shipped, MaterialStatus.Unordered]
    },
    {
      ...baseColDef,
      field: 'type',
      headerName: 'Type',
      type: 'string'
    },
    {
      ...baseColDef,
      field: 'name',
      headerName: 'Name',
      type: 'string'
    },
    {
      ...baseColDef,
      flex: 1.2,
      field: 'manufacturer',
      headerName: 'Manufacturer',
      type: 'string'
    },
    {
      ...baseColDef,
      flex: 1.4,
      field: 'manufacturerPN',
      headerName: 'Manufacterer PN',
      type: 'string'
    },
    {
      ...baseColDef,
      flex: 1.3,
      field: 'pdmFileName',
      headerName: 'PDM File Name',
      type: 'string'
    },
    {
      ...baseColDef,
      field: 'quantity',
      headerName: 'Quantity',
      type: 'number'
    },
    {
      ...baseColDef,
      field: 'price',
      headerName: 'Price',
      type: 'number'
    },
    {
      ...baseColDef,
      field: 'subtotal',
      headerName: 'Subtotal',
      type: 'number'
    },
    {
      ...baseColDef,
      field: 'link',
      headerName: 'Link',
      type: 'string'
    },
    {
      ...baseColDef,
      field: 'notes',
      headerName: 'Notes',
      type: 'string'
    },
    {
      ...baseColDef,
      flex: 0.1,
      field: 'actions',
      type: 'actions',
      getActions
    }
  ];

  const noAssemblyMaterials = materials.filter((material) => !material.assembly);

  const rows = noAssemblyMaterials.map(materialToRow);

  assemblies.forEach((assembly) => {
    const assemblyMaterials = materials.filter((material) => material.assemblyId !== assembly.assemblyId);
    //todo: add assembly rows
    //row.push(assemblyRow)
    rows.concat(assemblyMaterials.map(materialToRow));
  });

  return (
    <Box
      sx={{
        width: '100%',
        '& .super-app-theme--header': {
          backgroundColor: '#ef4345'
        }
      }}
    >
      <DataGrid
        columns={columns}
        rows={rows}
        pageSize={pageSize}
        rowsPerPageOptions={[5, 10, 15, 25, 100]}
        onPageSizeChange={(newPageSize) => {
          localStorage.setItem(tableRowCount, String(newPageSize));
          setPageSize(newPageSize);
        }}
        sx={styles.datagrid}
        autoHeight={true}
      />
    </Box>
  );
};

export default BOMTable;
