import { Box } from '@mui/system';
import { GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Project, isLeadership } from 'shared';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import BOMTable from './BOMTable';
import { useToast } from '../../../../hooks/toasts.hooks';
import { useAssignMaterialToAssembly, useDeleteAssembly, useDeleteMaterial } from '../../../../hooks/bom.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import EditMaterialModal from './MaterialForm/EditMaterialModal';
import { Typography } from '@mui/material';
import { bomBaseColDef } from '../../../../utils/bom.utils';
import NERModal from '../../../../components/NERModal';
import { renderStatusBOM } from './BOMTableCustomCells';
import LinkIcon from '@mui/icons-material/Link';
import NotesIcon from '@mui/icons-material/Notes';

interface BOMTableWrapperProps {
  project: Project;
}

const BOMTableWrapper: React.FC<BOMTableWrapperProps> = ({ project }) => {
  const [showEditMaterial, setShowEditMaterial] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const { mutateAsync: deleteMaterialMutateAsync, isLoading } = useDeleteMaterial();
  const { mutateAsync: deleteAssemblyMutateAsync } = useDeleteAssembly();
  const { mutateAsync: assignMaterialToAssembly } = useAssignMaterialToAssembly();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const user = useCurrentUser();
  const toast = useToast();

  if (isLoading) return <LoadingIndicator />;

  const assignMaterial = (materialId: string, assemblyId?: string) => async () => {
    try {
      await assignMaterialToAssembly({ materialId, assemblyId }).finally(() =>
        toast.success('Material Successfully Reassigned!')
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  const deleteMaterial = (id: string) => async () => {
    try {
      await deleteMaterialMutateAsync({ materialId: id }).finally(() => toast.success('Material Successfully Deleted!'));
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    }
  };

  const deleteAssembly = (id: string) => async () => {
    try {
      await deleteAssemblyMutateAsync({ assemblyId: id }).finally(() => toast.success('Assembly Successfully Deleted!'));
    } catch (e: unknown) {
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

  const selectedMaterial = materials.find((material) => material.materialId === selectedMaterialId);

  const getActions = (params: GridRowParams) => {
    const actions: JSX.Element[] = [];
    const rowId = String(params.row.id);
    const material = materials.find((mat) => mat.materialId === params.row.materialId);
    const shouldShowInMenu = windowWidth < 1000;

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
      actions.push(
        <GridActionsCellItem
          icon={<LinkIcon fontSize="small" />}
          label="Link"
          showInMenu={shouldShowInMenu}
          disabled={!editPerms}
          onClick={() => {
            window.open(params.row.link, '_blank');
          }}
        />
      );
      actions.push(
        <GridActionsCellItem
          icon={<NotesIcon fontSize="small" />}
          label="Notes"
          showInMenu={shouldShowInMenu}
          disabled={!editPerms}
          onClick={() => {
            setSelectedMaterialId(params.row.materialId);
            setModalShow(true);
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
    if (rowId.includes('assembly')) {
      actions.push(
        <GridActionsCellItem
          icon={<DeleteIcon fontSize="small" />}
          label="Delete"
          disabled={!isLeadership(user.role)}
          showInMenu
          onClick={deleteAssembly(params.row.assemblyId)}
        />
      );
    }
    return actions;
  };

  const columns: GridColumns<any> = [
    {
      ...bomBaseColDef,
      flex: 1.2,
      field: 'status',
      headerName: 'Status',
      renderCell: renderStatusBOM,
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
      filterable: false,
      colSpan: ({ row }) => {
        if (row.id.includes('assembly')) {
          return 2;
        } else {
          return 1;
        }
      }
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
      headerName: 'Price per Unit',
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
      flex: 1,
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      getActions,
      sortable: false,
      filterable: false
    }
  ];

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
      <BOMTable columns={columns} assemblies={project.assemblies} materials={project.materials} />
    </Box>
  );
};

export default BOMTableWrapper;
