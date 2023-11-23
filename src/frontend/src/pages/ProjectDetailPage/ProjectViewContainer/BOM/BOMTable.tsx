import { Box } from '@mui/system';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { Assembly, Material } from 'shared';
import { BomRow, bomTableStyles, materialToRow } from '../../../../utils/bom.utils';

interface BOMTableProps {
  columns: GridColumns<BomRow>;
  materials: Material[];
  assemblies: Assembly[];
}

const BOMTable: React.FC<BOMTableProps> = ({ columns, materials, assemblies }) => {
  const noAssemblyMaterials = materials.filter((material) => !material.assembly);

  const rows: BomRow[] = noAssemblyMaterials.map(materialToRow);

  assemblies.forEach((assembly) => {
    const assemblyMaterials = materials.filter((material) => material.assemblyId === assembly.assemblyId);
    rows.push({
      id: `assembly-${assembly.name}`,
      materialId: '',
      status: '',
      type: '',
      name: '',
      manufacturer: '',
      manufacturerPN: `Assembly: ${assembly.name}`,
      pdmFileName: '',
      quantity: '',
      price: '',
      subtotal: '',
      link: '',
      notes: ''
    });
    assemblyMaterials.forEach((material, indx) => rows.push(materialToRow(material, indx)));
  });

  return (
    <Box
      sx={{
        height: 'calc(100vh - 260px)',
        width: '100%',
        '& .super-app-theme--header': {
          backgroundColor: '#ef4345'
        },
        '& .super-app-theme--assembly': {
          backgroundColor: '#997570',
          '&:hover': {
            backgroundColor: '#997570'
          },
          '&:focus': {
            backgroundColor: '#997570'
          }
        }
      }}
    >
      <DataGrid
        columns={columns}
        rows={rows}
        getRowClassName={(params) =>
          `super-app-theme--${String(params.row.id).includes('assembly') ? 'assembly' : 'material'}`
        }
        rowsPerPageOptions={[]}
        sx={bomTableStyles.datagrid}
        disableSelectionOnClick
        autoHeight={false}
      />
    </Box>
  );
};
export default BOMTable;
