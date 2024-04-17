import { Box } from '@mui/system';
import {
  GridCallbackDetails,
  GridColumnVisibilityModel,
  GridColumns,
  GridRowParams,
  GridValidRowModel
} from '@mui/x-data-grid';
import { Assembly, Material } from 'shared';
import { BomRow, bomTableStyles, materialToRow, BomStyledDataGrid } from '../../../../utils/bom.utils';
import { addMaterialCosts } from '../BOMTab';
import { centsToDollar } from '../../../../utils/pipes';
import { useTheme } from '@mui/material';
import { useState } from 'react';

interface BOMTableProps {
  hideColumn: boolean[];
  setColumn: React.Dispatch<React.SetStateAction<boolean[]>>;
  columns: GridColumns<BomRow>;
  materials: Material[];
  assemblies: Assembly[];
}

const BOMTable: React.FC<BOMTableProps> = ({ hideColumn, setColumn, columns, materials, assemblies }) => {
  const [openRows, setOpenRows] = useState<String[]>([]);

  const arrowSymbol = (rowId: string) => {
    return openRows.includes(rowId) ? '⮝' : '⮟';
  };

  const noAssemblyMaterials = materials.filter((material) => !material.assembly);
  const theme = useTheme();
  const miscAssembly: BomRow = {
    id: `assembly-misc`,
    materialId: '',
    status: '',
    type: '',
    name: '',
    manufacturer: '',
    manufacturerPN: `Miscellaneous Materials: $${centsToDollar(
      noAssemblyMaterials.reduce(addMaterialCosts, 0)
    )}  ${arrowSymbol('assembly-misc')}`,
    pdmFileName: '',
    quantity: '',
    price: '',
    subtotal: '',
    link: '',
    notes: '',
    assemblyId: 'assembly-misc'
  };

  const rows: BomRow[] = [miscAssembly].concat(
    noAssemblyMaterials.map((material: Material, idx: number) => materialToRow(material, idx))
  );

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

  assemblies.forEach((assembly) => {
    console.log(assembly);
    const assemblyMaterials = materials.filter((material) => material.assemblyId === assembly.assemblyId);
    rows.push({
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
    assemblyMaterials.forEach((material, indx) => rows.push(materialToRow(material, indx)));
  });

  return (
    <Box
      sx={{
        height: 'calc(100vh - 180px)',
        width: '100%',
        '& .super-app-theme--header': {
          backgroundColor: '#ef4345'
        },
        '& .super-app-theme--assembly': {
          backgroundColor: theme.palette.grey[600],
          '&:hover': {
            backgroundColor: theme.palette.grey[700]
          },
          '&:focus': {
            backgroundColor: '#997570'
          }
        }
      }}
    >
      <BomStyledDataGrid
        onColumnVisibilityModelChange={(model: GridColumnVisibilityModel, details: GridCallbackDetails) => {
          //store a state inside a parent array (array in a parent class), and then every time the state changes, update the parent state, add another part that, on reload, we check the parent state and update the child state
          console.log(columns);
          const tempColumns: boolean[] = [];
          Object.keys(model).forEach((toDelete) => {
            tempColumns.push(model[toDelete]);
          });

          // Only call setColumn if tempColumns is different from the current column visibility model
          if (JSON.stringify(tempColumns) !== JSON.stringify(columns)) {
            setColumn(tempColumns);
          }
        }}
        columns={columns as GridColumns<GridValidRowModel>}
        rows={rows.filter(isAssemblyOpen)}
        getRowClassName={(params) =>
          `super-app-theme--${String(params.row.id).includes('assembly') ? 'assembly' : 'material'}`
        }
        rowsPerPageOptions={[100]}
        sx={bomTableStyles.datagrid}
        disableSelectionOnClick
        autoHeight={false}
        onRowClick={openAssembly}
      />
    </Box>
  );
};
export default BOMTable;
