import { Grid } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import VendorsTable from './VendorsTable';
import AccountCodesTable from './AccountCodesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <PageBlock title="Finance Config">
      <Grid container spacing="3%">
        <Grid item direction="column" xs={6}>
          <VendorsTable />
        </Grid>
        <Grid item direction="column" alignSelf="right" xs={6}>
          <AccountCodesTable />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default AdminToolsFinanceConfig;
