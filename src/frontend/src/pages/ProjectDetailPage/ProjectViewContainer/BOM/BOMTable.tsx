import { Box } from '@mui/system';
import { DataGrid, GridColumns } from '@mui/x-data-grid';
import { Assembly, Material } from 'shared';
import { bomTableStyles, materialToRow } from '../../../../utils/bom.utils';
import { useTheme } from '@mui/material';

const BOMTable = ({
  columns,
  materials,
  assemblies
}: {
  columns: GridColumns<any>;
  materials: Material[];
  assemblies: Assembly[];
}) => {
  const theme = useTheme();
  const noAssemblyMaterials = materials.filter((material) => !material.assembly);

  const rows: any = noAssemblyMaterials.map(materialToRow);

  assemblies.forEach((assembly) => {
    const assemblyMaterials = materials.filter((material) => material.assemblyId === assembly.assemblyId);
    rows.push({
      id: `assembly-${assembly.name}`,
      materialId: '',
      status: '',
      type: '',
      name: '',
      manufacturer: '',
      manufacturerPN: 'Assembly:',
      pdmFileName: assembly.name,
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
          backgroundColor: theme.palette.background.paper
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
