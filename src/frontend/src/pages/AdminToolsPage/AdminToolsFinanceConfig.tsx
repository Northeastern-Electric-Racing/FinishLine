import { Grid } from '@mui/material';
import PageBlock from '../../layouts/PageBlock';
import VendorsTable from './VendorsTable';
import AccountCodesTable from './AccountCodesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <PageBlock title="Finance Config">
      <Grid container spacing="3%">
        <VendorsTable />
        <AccountCodesTable />
      </Grid>
    </PageBlock>
  );
};

export default AdminToolsFinanceConfig;
