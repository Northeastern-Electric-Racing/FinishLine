import { Grid, Typography } from '@mui/material';
import ManufacturerTable from './BOMConfig/ManufacturerTable';
import MaterialTypeTable from './BOMConfig/MaterialTypeTable';
import UnitTable from './BOMConfig/UnitTable';
import { Box } from '@mui/system';

const AdminToolsBOMConfig: React.FC = () => {
  return (
    <Box paddingBottom="4">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Bill of Materials Config
      </Typography>
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}>
          <ManufacturerTable />
        </Grid>
        <Grid item direction="column" alignSelf="right" xs={12} md={6}>
          <MaterialTypeTable />
        </Grid>
        <Grid item direction="column" xs={12} md={6}>
          <UnitTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsBOMConfig;
