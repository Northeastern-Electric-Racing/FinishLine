import { Grid } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import VendorsTable from './FinanceConfig/VendorsTable';
import AccountCodesTable from './FinanceConfig/AccountCodesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <PageBlock title="Finance Config">
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}>
          <VendorsTable />
        </Grid>
        <Grid item direction="column" alignSelf="right" xs={12} md={6}>
          <AccountCodesTable />
        </Grid>
      </Grid>
    </PageBlock>
  );
};

export default AdminToolsFinanceConfig;
