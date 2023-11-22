import { Box } from '@mui/system';
import { GridActionsCellItem, GridColumns, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import { useState } from 'react';
import { MaterialStatus, Project, isLeadership } from 'shared';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import BOMTable from './BOMTable';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useAssignMaterialToAssembly, useDeleteMaterial } from '../../../../hooks/bom.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import EditMaterialModal from './MaterialForm/EditMaterialModal';
import { Link, Typography } from '@mui/material';
import { BOM_TABLE_ROW_COUNT, bomBaseColDef } from '../../../../utils/bom.utils';
import NERModal from '../../../../components/NERModal';
import { displayEnum } from '../../../../utils/pipes';

const renderLink = (params: GridRenderCellParams) =>
  params.value && (
    <Link href={params.value} target="_blank" underline="hover" sx={{ pl: 1 }}>
      Buyer Link
    </Link>
  );

const renderStatus = (params: GridRenderCellParams) => {
  if (!params.value) return;
  const status = params.value;
  const color =
    status === MaterialStatus.Ordered
      ? 'orange'
      : status === MaterialStatus.Unordered
      ? 'red'
      : status === MaterialStatus.Received
      ? 'green'
      : status === MaterialStatus.Shipped
      ? 'yellow'
      : 'grey';
  return (
    <Box sx={{ backgroundColor: color, padding: '6px 10px 6px 10px', borderRadius: '6px' }}>
      <Typography fontSize="14px" color="black">
        {displayEnum(status)}
      </Typography>
    </Box>
  );
};

const BOMTableWrapper = ({ project }: { project: Project }) => {
  const [showEditMaterial, setShowEditMaterial] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const { mutateAsync: deleteMaterialMutateAsync, isLoading } = useDeleteMaterial();
  const { mutateAsync: assignMaterialToAssembly } = useAssignMaterialToAssembly();

  const user = useCurrentUser();
  const toast = useToast();

  if (isLoading) return <LoadingIndicator />;

  const assignMaterial = (materialId: string, assemblyId?: string) => async () => {
    try {
      await assignMaterialToAssembly({ materialId, assemblyId }).finally(() =>
        toast.success('Material Successfully Deleted!')
      );
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  const deleteMaterial = (id: string) => async () => {
    try {
      await deleteMaterialMutateAsync({ materialId: id }).finally(() => toast.success('Material Successfully Deleted!'));
    } catch (e: unknown) {
      console.log(e);
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  const renderNotes = (params: GridRenderCellParams) =>
    params.value && (
      <Link
        onClick={() => {
          setSelectedMaterialId(params.row.materialId);
          setModalShow(true);
        }}
      >
        See Notes
      </Link>
    );

  const editPerms =
    isLeadership(user.role) ||
    project.teams.some((team) => team.head.userId === user.userId) ||
    project.teams.some((team) => team.leads.map((lead) => lead.userId).includes(user.userId)) ||
    project.teams.some((team) => team.members.map((member) => member.userId).includes(user.userId));

  const { assemblies, materials } = project;

  const selectedMaterial = materials.find((material) => material.materialId === selectedMaterialId);

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
              disabled={!editPerms}
              onClick={assignMaterial(params.row.materialId, assembly.assemblyId)}
            />
          );
        } else {
          actions.push(
            <GridActionsCellItem
              icon={<MoveToInboxIcon fontSize="small" />}
              label={`Remove From Assembly: ${assembly.name}`}
              showInMenu
              disabled={!editPerms}
              onClick={assignMaterial(params.row.materialId)}
            />
          );
        }
      });
    }
    return actions;
  };

  const columns: GridColumns<any> = [
    {
      ...bomBaseColDef,
      flex: 1.2,
      field: 'status',
      headerName: 'Status',
      renderCell: renderStatus,
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      field: 'type',
      headerName: 'Type',
      type: 'string',
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      flex: 1.5,
      field: 'name',
      headerName: 'Name',
      type: 'string',
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      flex: 1.2,
      field: 'manufacturer',
      headerName: 'Manufacturer',
      type: 'string',
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      flex: 1.5,
      field: 'manufacturerPN',
      headerName: 'Manufacterer PN',
      type: 'string',
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      flex: 1.3,
      field: 'pdmFileName',
      headerName: 'PDM File Name',
      type: 'string',
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      field: 'quantity',
      headerName: 'Quantity',
      type: 'number',
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      field: 'price',
      headerName: 'Price',
      type: 'number',
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      field: 'subtotal',
      headerName: 'Subtotal',
      type: 'number',
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      field: 'link',
      headerName: 'Link',
      type: 'string',
      renderCell: renderLink,
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      field: 'notes',
      headerName: 'Notes',
      type: 'string',
      renderCell: renderNotes,
      sortable: false,
      filterable: false
    },
    {
      ...bomBaseColDef,
      flex: 0.1,
      field: 'actions',
      type: 'actions',
      getActions,
      sortable: false,
      filterable: false
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
          material={selectedMaterial!}
          wbsElement={project}
        />
      )}
      {modalShow && (
        <NERModal
          open={modalShow}
          title={`${selectedMaterial?.name} Material Notes`}
          onHide={() => setModalShow(false)}
          hideFormButtons
          showCloseButton
        >
          <Box sx={{ minWidth: '320px' }}>
            <Typography>{selectedMaterial?.notes}</Typography>
          </Box>
        </NERModal>
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
