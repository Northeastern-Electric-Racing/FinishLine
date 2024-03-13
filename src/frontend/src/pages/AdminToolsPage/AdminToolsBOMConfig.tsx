import { Grid } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import ManufacturerTable from './BOMConfig/ManufacturerTable';
import MaterialTypeTable from './BOMConfig/MaterialTypeTable';
import UnitTable from './BOMConfig/UnitTable';

const AdminToolsBOMConfig: React.FC = () => {
  return (
    <PageBlock title="Bill of Materials Config">
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
    </PageBlock>
  );
};

export default AdminToolsBOMConfig;
