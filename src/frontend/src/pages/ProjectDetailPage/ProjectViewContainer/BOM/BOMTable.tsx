import { Box } from '@mui/system';
import { GridColumnVisibilityModel, GridColumns, GridRowParams, GridValidRowModel } from '@mui/x-data-grid';
import { Assembly, Material } from 'shared';
import { BomRow, bomTableStyles, materialToRow, BomStyledDataGrid } from '../../../../utils/bom.utils';
import { addMaterialCosts } from '../BOMTab';
import { centsToDollar } from '../../../../utils/pipes';
import { useTheme } from '@mui/material';
import { useState } from 'react';

interface BOMTableProps {
  setHideColumn: React.Dispatch<React.SetStateAction<boolean[]>>;
  assignMaterial: (materialId: string, assemblyId?: string) => () => Promise<void>;
  columns: GridColumns<BomRow>;
  materials: Material[];
  assemblies: Assembly[];
  processRowUpdate: (newRow: BomRow, oldRow: BomRow) => Promise<BomRow>;
  onProcessRowUpdateError: (error: unknown) => void;
  editPerms: boolean;
}

const BOMTable: React.FC<BOMTableProps> = ({
  setHideColumn,
  assignMaterial,
  columns,
  materials,
  assemblies,
  processRowUpdate,
  onProcessRowUpdateError,
  editPerms
}) => {
  const [openRows, setOpenRows] = useState<String[]>([]);
  const [draggedMaterial, setDraggedMaterial] = useState<Material | null>(null);

  const arrowSymbol = (rowId: string) => {
    return openRows.includes(rowId) ? '▼' : '▶';
  };

  const noAssemblyMaterials = materials.filter((material) => !material.assemblyId);
  const theme = useTheme();

  const rows: BomRow[] = noAssemblyMaterials.map((material: Material, idx: number) => materialToRow(material, idx));

  const isAssemblyOpen = (row: BomRow) => {
    return !row.assemblyId || row.assemblyId === '' || openRows.includes(row.assemblyId) || row.id.startsWith('assembly');
  };

  const openAssembly = (event: GridRowParams) => {
    if (!event.row.id.startsWith('assembly')) return;
    if (openRows.includes(event.row.assemblyId)) {
      setOpenRows(openRows.filter((e) => e !== event.row.assemblyId));
    } else {
      setOpenRows(openRows.concat([event.row.assemblyId]));
    }
  };

  const materialsWithAssemblies: BomRow[] = [];

  assemblies.forEach((assembly) => {
    const assemblyMaterials = materials.filter((material) => material.assemblyId === assembly.assemblyId);

    materialsWithAssemblies.push({
      reimbursementRequests: [],
      id: `assembly-${assembly.name}`,
      materialId: '',
      status: '',
      type: '',
      name: '',
      manufacturer: '',
      manufacturerPN: `Assembly - ${assembly.name}: $${centsToDollar(
        assembly.materials.reduce(addMaterialCosts, 0)
      )}  ${arrowSymbol(assembly.assemblyId)}`,
      pdmFileName: '',
      quantity: '',
      price: '',
      subtotal: '',
      link: '',
      notes: '',
      assemblyId: assembly.assemblyId
    });

    assemblyMaterials.forEach((material, indx) => materialsWithAssemblies.push(materialToRow(material, indx)));
  });

  // drag and drop mechanics
  const handleDragStart = (materialId: string) => {
    const material = materials.find((m) => m.materialId === materialId);
    if (material) {
      setDraggedMaterial(material);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent, targetAssemblyId?: string) => {
    event.preventDefault();
    if (!draggedMaterial) return;

    assignMaterial(draggedMaterial.materialId, targetAssemblyId)().finally(() => {
      setDraggedMaterial(null);
    });
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 200px)',
        width: '100%',

        '& .super-app-theme--header': {
          backgroundColor: '#ef4345'
        },

        '& .super-app-theme--even': {
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
        },
        '& .super-app-theme--odd': {
          border: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
        },

        '& .MuiDataGrid-row:hover': {
          backgroundColor: 'rgba(239, 67, 69, 0.6)'
        },

        '& .super-app-theme--assembly': {
          backgroundColor: theme.palette.grey[600],
          '&:hover': {
            backgroundColor: 'rgba(239, 67, 69, 0.6)'
          },
          '&:focus': {
            backgroundColor: '#997570'
          }
        }
      }}
    >
      <BomStyledDataGrid
        onColumnVisibilityModelChange={(model: GridColumnVisibilityModel) => {
          //store a state inside a parent array (array in a parent class), and then every time the state changes, update the parent state, add another part that, on reload, we check the parent state and update the child state
          const tempColumns: boolean[] = [];
          Object.keys(model).forEach((toDelete) => {
            tempColumns.push(!model[toDelete]);
          });

          setHideColumn(tempColumns);
          localStorage.setItem('hideColumn', JSON.stringify(tempColumns));
        }}
        columns={columns as GridColumns<GridValidRowModel>}
        rows={rows.concat(materialsWithAssemblies.filter(isAssemblyOpen))}
        getRowClassName={(params) => {
          const stripe = params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd';
          const isAssemblyRow = String(params.row.id).startsWith('assembly-');
          return `super-app-theme--${stripe}${isAssemblyRow ? ' super-app-theme--assembly' : ''}`;
        }}
        rowsPerPageOptions={[100]}
        sx={bomTableStyles.datagrid}
        disableSelectionOnClick
        autoHeight={false}
        experimentalFeatures={{ newEditingApi: true }}
        processRowUpdate={
          processRowUpdate as unknown as (newRow: GridValidRowModel, oldRow: GridValidRowModel) => Promise<GridValidRowModel>
        }
        onProcessRowUpdateError={onProcessRowUpdateError}
        isCellEditable={(params) => editPerms && !String(params.row.id).startsWith('assembly')}
        onRowClick={openAssembly}
        componentsProps={{
          row: {
            draggable: true,
            onDragStart: (event: React.DragEvent) => {
              if (event.currentTarget.className.includes('super-app-theme--assembly')) {
                event.preventDefault();
              }
              const rowIndex = parseInt(event.currentTarget.getAttribute('data-rowindex') || '0');
              const materials = rows.concat(materialsWithAssemblies.filter(isAssemblyOpen));
              const { materialId } = materials[rowIndex];
              handleDragStart(materialId);
            },
            onDrop: (event: React.DragEvent) => {
              const rowIndex = parseInt(event.currentTarget.getAttribute('data-rowindex') || '0');
              const materials = rows.concat(materialsWithAssemblies.filter(isAssemblyOpen));
              const { assemblyId } = materials[rowIndex];

              if (assemblyId === 'assembly-misc') {
                handleDrop(event);
              } else {
                handleDrop(event, assemblyId);
              }
            },
            onDragOver: (event: React.DragEvent) => handleDragOver(event),
            onDragEnd: (event: React.DragEvent) => {
              if (!event.currentTarget.parentElement) {
                return;
              }
              const tableRect = event.currentTarget.parentElement.getBoundingClientRect();
              if (event.clientY < tableRect.top) {
                handleDrop(event);
              }
            }
          }
        }}
      />
    </Box>
  );
};

export default BOMTable;
