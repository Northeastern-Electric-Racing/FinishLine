import { Grid, Typography } from '@mui/material';
import VendorsTable from './FinanceConfig/VendorsTable';
import AccountCodesTable from './FinanceConfig/AccountCodesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <div>
      <Typography variant="h4">Finance Config</Typography>
      <br />
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}>
          <VendorsTable />
        </Grid>
        <Grid item direction="column" alignSelf="right" xs={12} md={6}>
          <AccountCodesTable />
        </Grid>
      </Grid>
    </div>
  );
};

export default AdminToolsFinanceConfig;
