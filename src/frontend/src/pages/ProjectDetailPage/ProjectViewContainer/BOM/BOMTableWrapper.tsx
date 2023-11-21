import { Box } from '@mui/system';
import { GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid';
import { useState } from 'react';
import { Project, isLeadership } from 'shared';
import { GridColDefStyle } from '../../../../utils/tables';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import EditMaterialModal from '../../../BOMsPage/MaterialForm/EditMaterialModal';
import BOMTable from './BOMTable';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useDeleteMaterial } from '../../../../hooks/bom.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';

const BOM_TABLE_ROW_COUNT = 'tl-table-row-count';

const baseColDef: GridColDefStyle = {
  flex: 1,
  align: 'center',
  headerAlign: 'center',
  headerClassName: 'super-app-theme--header'
};

const BOMTableWrapper = ({ project }: { project: Project }) => {
  const [showEditMaterial, setShowEditMaterial] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const { mutateAsync: deleteMaterialMutateAsync, isLoading } = useDeleteMaterial();

  const user = useCurrentUser();
  const toast = useToast();

  if (isLoading) return <LoadingIndicator />;

  const deleteMaterial = (id: string) => async () => {
    console.log(id);
    try {
      await deleteMaterialMutateAsync({ materialId: id }).finally(() => toast.success('Material Successfully Deleted!'));
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  const editPerms =
    isLeadership(user.role) ||
    project.teams.some((team) => team.head.userId === user.userId) ||
    project.teams.some((team) => team.leads.map((lead) => lead.userId).includes(user.userId)) ||
    project.teams.some((team) => team.members.map((member) => member.userId).includes(user.userId));

  const { assemblies, materials } = project;

  const getActions = (params: GridRowParams) => {
    const actions: JSX.Element[] = [];
    const rowId = String(params.row.id);
    const material = materials.find((mat) => mat.materialId === params.row.materialId);

    if (!rowId.includes('assembly')) {
      actions.push(
        <GridActionsCellItem
          icon={<DeleteIcon fontSize="small" />}
          label="Delete"
          disabled={!isLeadership(user.role)}
          showInMenu
          onClick={deleteMaterial(params.row.materialId)}
        />
      );
      actions.push(
        <GridActionsCellItem
          icon={<EditIcon fontSize="small" />}
          label="Edit"
          showInMenu
          disabled={!editPerms}
          onClick={() => {
            setSelectedMaterialId(params.row.materialId);
            setShowEditMaterial(true);
          }}
        />
      );
      assemblies.forEach((assembly) => {
        if (!(material && assembly.assemblyId === material.assemblyId)) {
          actions.push(
            <GridActionsCellItem
              icon={<MoveToInboxIcon fontSize="small" />}
              label={`Switch to Assembly: ${assembly.name}`}
              showInMenu
              disabled={true}
              onClick={() => {}}
            />
          );
        } else {
          actions.push(
            <GridActionsCellItem
              icon={<MoveToInboxIcon fontSize="small" />}
              label={`Remove From Assembly: ${assembly.name}`}
              showInMenu
              disabled={true}
              onClick={() => {}}
            />
          );
        }
      });
    }
    return actions;
  };

  const columns: GridColumns<any> = [
    {
      ...baseColDef,
      flex: 2,
      field: 'status',
      headerName: 'Status'
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
      flex: 1.5,
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

  if (!localStorage.getItem(BOM_TABLE_ROW_COUNT)) {
    localStorage.setItem(BOM_TABLE_ROW_COUNT, '25');
  }

  return (
    <Box>
      {showEditMaterial && (
        <EditMaterialModal
          open={showEditMaterial}
          onHide={() => setShowEditMaterial(false)}
          material={materials.find((material) => material.materialId === selectedMaterialId)!}
          wbsElement={project}
        />
      )}
      <BOMTable
        columns={columns}
        assemblies={project.assemblies}
        materials={project.materials}
        tableRowCount={BOM_TABLE_ROW_COUNT}
      />
    </Box>
  );
};

export default BOMTableWrapper;
