import { Box, Grid, Typography } from '@mui/material';
import AccountManagerTable from './FinanceConfig/AccountManagerTable';
import CategoriesTable from './FinanceConfig/CategoriesTable';
import SponsorTierTable from './FinanceConfig/SponsorTierTable';
import IndexCodesTable from './FinanceConfig/IndexCodesTable';
import FinanceDelegatesTable from './FinanceConfig/FinanceDelegatesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Finance Config
      </Typography>
      <Grid container spacing={2}>
        <Grid item direction="column" xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AccountManagerTable />
          <SponsorTierTable />
        </Grid>
        <Grid item direction="column" xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <CategoriesTable />
          <IndexCodesTable />
          <FinanceDelegatesTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsFinanceConfig;
