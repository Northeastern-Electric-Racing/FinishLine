import { Box } from '@mui/system';
import { GridActionsCellItem, GridColumns, GridRowParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Assembly, Material, Project, isLeadership } from 'shared';
import Decimal from 'decimal.js';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import { useCurrentUser } from '../../../../hooks/users.hooks';
import BOMTable from './BOMTable';
import { useToast } from '../../../../hooks/toasts.hooks';
import {
  useAssignMaterialToAssembly,
  useDeleteAssembly,
  useDeleteMaterial,
  useEditMaterialById,
  useGetAllManufacturers,
  useGetAllMaterialTypes
} from '../../../../hooks/bom.hooks';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import EditMaterialModal from './MaterialForm/EditMaterialModal';
import { BomRow, bomBaseColDef } from '../../../../utils/bom.utils';
import { centsToDollar } from '../../../../utils/pipes';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Button, Link, Tooltip, Typography } from '@mui/material';
import NERModal from '../../../../components/NERModal';
import { StatusDropdownCell } from './BOMTableCustomCells';
import LinkIcon from '@mui/icons-material/Link';
import NotesIcon from '@mui/icons-material/Notes';
import { routes } from '../../../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';

interface BOMTableWrapperProps {
  project: Project;
  hideColumn: boolean[];
  setHideColumn: React.Dispatch<React.SetStateAction<boolean[]>>;
  assemblies: Assembly[];
  materials: Material[];
  refetch: () => void;
}

const BOMTableWrapper: React.FC<BOMTableWrapperProps> = ({
  project,
  hideColumn,
  setHideColumn,
  assemblies,
  materials,
  refetch
}) => {
  const [showEditMaterial, setShowEditMaterial] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  const [modalShow, setModalShow] = useState(false);
  const { mutateAsync: deleteMaterialMutateAsync, isLoading: deleteMaterialIsLoading } = useDeleteMaterial(project.wbsNum);
  const { mutateAsync: deleteAssemblyMutateAsync, isLoading: deleteAssemblyIsLoading } = useDeleteAssembly(project.wbsNum);
  const { mutateAsync: assignMaterialToAssembly } = useAssignMaterialToAssembly();
  const { mutateAsync: editMaterial } = useEditMaterialById(project.wbsNum);
  const { data: materialTypes } = useGetAllMaterialTypes();
  const { data: manufacturers } = useGetAllManufacturers();

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

  useEffect(() => {
    const storedHideColumn = JSON.parse(localStorage.getItem('hideColumn') || 'false');
    if (storedHideColumn === 'false') {
      setHideColumn((prev) => {
        const newHideColumn = new Array(12).fill(false);
        return prev !== newHideColumn ? newHideColumn : prev;
      });
    } else {
      setHideColumn((prev) => (prev !== storedHideColumn ? storedHideColumn : prev));
    }
  }, [setHideColumn]);

  if (deleteMaterialIsLoading || deleteAssemblyIsLoading) return <LoadingIndicator />;

  const assignMaterial = (materialId: string, assemblyId?: string) => async () => {
    try {
      await assignMaterialToAssembly({ materialId, assemblyId }).finally(() =>
        toast.success('Material Successfully Reassigned!')
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 6000);
      }
    } finally {
      refetch();
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

  const processRowUpdate = async (newRow: BomRow, oldRow: BomRow): Promise<BomRow> => {
    // assemblies are not editable
    if (newRow.id.startsWith('assembly')) return newRow;

    const material = materials.find((m) => m.materialId === newRow.materialId);
    if (!material) return newRow;

    const quantityChanged = newRow.quantityRaw !== oldRow.quantityRaw;
    const priceChanged = newRow.priceRaw !== oldRow.priceRaw;

    if (
      newRow.name === oldRow.name &&
      newRow.type === oldRow.type &&
      newRow.manufacturer === oldRow.manufacturer &&
      newRow.manufacturerPN === oldRow.manufacturerPN &&
      newRow.pdmFileName === oldRow.pdmFileName &&
      !quantityChanged &&
      !priceChanged
    )
      return newRow;

    if (newRow.name !== undefined && !newRow.name.trim()) {
      toast.error('Name cannot be empty');
      return oldRow;
    }
    if (quantityChanged && newRow.quantityRaw !== undefined && (isNaN(newRow.quantityRaw) || newRow.quantityRaw <= 0)) {
      toast.error('Quantity must be a positive number');
      return oldRow;
    }
    if (priceChanged && newRow.priceRaw !== undefined && (isNaN(newRow.priceRaw) || newRow.priceRaw < 0)) {
      toast.error('Price must be a non-negative number');
      return oldRow;
    }

    const changedFields: string[] = [];
    if (newRow.name !== oldRow.name) changedFields.push('Name');
    if (newRow.type !== oldRow.type) changedFields.push('Type');
    if (newRow.manufacturer !== oldRow.manufacturer) changedFields.push('Manufacturer');
    if (newRow.manufacturerPN !== oldRow.manufacturerPN) changedFields.push('Manufacturer PN');
    if (newRow.pdmFileName !== oldRow.pdmFileName) changedFields.push('PDM File Name');
    if (quantityChanged) changedFields.push('Quantity');
    if (priceChanged) changedFields.push('Price');

    const priceInCents = priceChanged && newRow.priceRaw !== undefined ? Math.round(newRow.priceRaw * 100) : material.price;
    const quantityValue =
      quantityChanged && newRow.quantityRaw != null ? new Decimal(newRow.quantityRaw) : material.quantity;

    try {
      await editMaterial({
        materialId: material.materialId,
        payload: {
          name: newRow.name,
          status: material.status,
          materialTypeName: newRow.type,
          manufacturerName: newRow.manufacturer || undefined,
          manufacturerPartNumber: newRow.manufacturerPN || undefined,
          pdmFileName: newRow.pdmFileName,
          price: priceInCents,
          quantity: quantityValue,
          unitName: material.unitName,
          linkUrl: material.linkUrl,
          notes: material.notes,
          assemblyId: material.assemblyId
        }
      });
      toast.success(`Material ${changedFields.join(', ')} updated successfully`);
      return {
        ...newRow,
        quantity: material.unitName ? `${quantityValue} ${material.unitName}` : `${quantityValue}`,
        price: priceInCents !== undefined ? `$${centsToDollar(priceInCents)}` : newRow.price,
        priceRaw: priceInCents !== undefined ? priceInCents / 100 : newRow.priceRaw
      };
    } catch (e: unknown) {
      if (e instanceof Error) toast.error(e.message, 6000);
      return oldRow;
    }
  };

  const selectedMaterial = materials.find((material) => material.materialId === selectedMaterialId);

  const getActions = (params: GridRowParams) => {
    const actions: JSX.Element[] = [];
    const rowId = params.row.id;
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
  //Try to have the updated column created in BOMTable stored here, and then look at if the name of the column appears here, if it does then we dont hide, else we hide.
  const columns: GridColumns<any> = [
    {
      ...bomBaseColDef,
      flex: 1,
      field: 'reimbursementRequests',
      headerName: 'RR#',
      type: 'string',
      sortable: false,
      filterable: false,
      hide: hideColumn[0],
      renderCell: (params) => {
        const material = materials.find((m) => m.materialId === params.row.materialId);
        if (!material) return null;

        const { reimbursementRequests } = material;

        // case 1 (if linked reimbursement requests exist): show a list of links
        if (reimbursementRequests.length > 0) {
          return (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              {reimbursementRequests.map((rr) => (
                <Link
                  key={rr.reimbursementRequestId}
                  component={RouterLink}
                  to={`${routes.REIMBURSEMENT_REQUESTS}/view/${rr.reimbursementRequestId}`}
                  underline="hover"
                  sx={{ color: '#dd514c', fontWeight: 'bold', cursor: 'pointer' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {rr.identifier}
                </Link>
              ))}
            </Box>
          );
        }

        // case 2 (no linked reimbursement requests): link to the create reimbursement request page with pre-filled info
        const { quantity, price } = material;

        const prefillCost = quantity != null && price != null ? (Number(quantity) * Number(price)) / 100 : undefined;

        return (
          <Button
            component={RouterLink}
            to={{
              pathname: routes.NEW_REIMBURSEMENT_REQUEST,
              state: {
                projectWbsNum: project.wbsNum,
                materialId: material.materialId,
                materialName: material.name,
                prefillCost
              }
            }}
            variant="contained"
            size="small"
            onClick={(e: React.MouseEvent<HTMLElement>) => e.stopPropagation()}
            sx={{
              backgroundColor: '#dd514c',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#c7443f' }
            }}
          >
            Create RR
          </Button>
        );
      }
    },
    {
      ...bomBaseColDef,
      flex: 1.4,
      field: 'status',
      headerName: 'Status',
      renderCell: (params) => {
        // assemblies are not editable
        if (!params.value || params.row.id.startsWith('assembly')) return null;
        const material = materials.find((m) => m.materialId === params.row.materialId);
        if (!material) return null;
        return (
          <StatusDropdownCell
            status={params.value}
            disabled={!editPerms}
            onStatusChange={async (newStatus) => {
              try {
                await editMaterial({
                  materialId: material.materialId,
                  payload: {
                    name: material.name,
                    status: newStatus,
                    materialTypeName: material.materialTypeName,
                    manufacturerName: material.manufacturerName,
                    manufacturerPartNumber: material.manufacturerPartNumber,
                    pdmFileName: material.pdmFileName,
                    price: material.price,
                    quantity: material.quantity,
                    unitName: material.unitName,
                    linkUrl: material.linkUrl,
                    notes: material.notes,
                    assemblyId: material.assemblyId
                  }
                });
                toast.success('Status updated successfully');
              } catch (e: unknown) {
                if (e instanceof Error) toast.error(e.message, 6000);
              }
            }}
          />
        );
      },
      sortable: false,
      filterable: false,
      hide: hideColumn[1]
    },
    {
      ...bomBaseColDef,
      field: 'type',
      headerName: 'Type',
      editable: editPerms,
      type: 'singleSelect',
      valueOptions: materialTypes?.map((mt) => mt.name) ?? [],
      sortable: false,
      filterable: false,
      hide: hideColumn[2]
    },
    {
      ...bomBaseColDef,
      flex: 1.5,
      field: 'name',
      headerName: 'Name',
      editable: editPerms,
      sortable: false,
      filterable: false,
      hide: hideColumn[3],
      renderCell: (params) => {
        const material = materials.find((m) => m.materialId === params.row.materialId);
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2">{params.value}</Typography>
            {material?.isCopied && (
              <Tooltip title="Copied from another BOM">
                <ContentCopyIcon sx={{ fontSize: 14, color: 'warning.main' }} />
              </Tooltip>
            )}
          </Box>
        );
      }
    },
    {
      ...bomBaseColDef,
      flex: 1.2,
      field: 'manufacturer',
      headerName: 'Manufacturer',
      editable: editPerms,
      type: 'singleSelect',
      valueOptions: ['', ...(manufacturers?.map((m) => m.name) ?? [])],
      sortable: false,
      filterable: false,
      hide: hideColumn[4]
    },
    {
      ...bomBaseColDef,
      flex: 1.5,
      field: 'manufacturerPN',
      headerName: 'Manufacterer PN',
      editable: editPerms,
      sortable: false,
      filterable: false,
      colSpan: ({ row }) => {
        if (row.id.includes('assembly')) {
          return 2;
        }
        return 1;
      },
      hide: hideColumn[5]
    },
    {
      ...bomBaseColDef,
      flex: 1.3,
      field: 'pdmFileName',
      headerName: 'PDM File Name',
      editable: editPerms,
      sortable: false,
      filterable: false,
      hide: hideColumn[6]
    },
    {
      ...bomBaseColDef,
      field: 'quantityRaw',
      headerName: 'Quantity',
      type: 'number',
      editable: editPerms,
      renderCell: (params) => params.row.quantity,
      sortable: false,
      filterable: false,
      hide: hideColumn[7]
    },
    {
      ...bomBaseColDef,
      field: 'priceRaw',
      headerName: 'Price per Unit',
      type: 'number',
      editable: editPerms,
      renderCell: (params) => params.row.price,
      sortable: false,
      filterable: false,
      hide: hideColumn[8]
    },
    {
      ...bomBaseColDef,
      field: 'subtotal',
      headerName: 'Subtotal',
      sortable: false,
      filterable: false,
      hide: hideColumn[9]
    },
    {
      ...bomBaseColDef,
      flex: 1,
      field: 'actions',
      headerName: 'Actions',
      type: 'actions',
      getActions,
      sortable: false,
      filterable: false,
      hide: hideColumn[12]
    }
  ];

  return (
    <Box>
      {showEditMaterial && (
        <EditMaterialModal
          open={showEditMaterial}
          onHide={() => setShowEditMaterial(false)}
          material={selectedMaterial!}
          assemblies={assemblies}
          wbsNum={project.wbsNum}
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
        setHideColumn={setHideColumn}
        assignMaterial={assignMaterial}
        columns={columns}
        assemblies={assemblies}
        materials={materials}
        processRowUpdate={processRowUpdate}
        onProcessRowUpdateError={(error) => {
          if (error instanceof Error) toast.error(error.message, 6000);
        }}
        editPerms={editPerms}
      />
    </Box>
  );
};

export default BOMTableWrapper;
