import { Grid } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import ManufacturerTable from './BOMConfig/ManufacturerTable';
import MaterialTypeTable from './BOMConfig/MaterialTypeTable';

const AdminToolsBOMConfig: React.FC = () => {
  return (
    <PageBlock title="Bill of Material Config">
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}>
          <ManufacturerTable />
        </Grid>
        <Grid item direction="column" alignSelf="right" xs={12} md={6}>
          <MaterialTypeTable />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default AdminToolsBOMConfig;
