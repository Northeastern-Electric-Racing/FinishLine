import { Box, Grid, Typography } from '@mui/material';
import AccountManagerTable from './FinanceConfig/AccountManagerTable';
import CategoriesTable from './FinanceConfig/CategoriesTable';
import SponsorTierTable from './FinanceConfig/SponsorTierTable';
import IndexCodesTable from './FinanceConfig/IndexCodesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Finance Config
      </Typography>
      <Grid container spacing="2%">
        <Grid item direction="column" xs={12} md={6}>
          <AccountManagerTable />
        </Grid>
        <Grid item direction="column" alignSelf="right" xs={12} md={6}>
          <CategoriesTable />
        </Grid>
        <Grid item direction="column" xs={12} md={6}>
          <SponsorTierTable />
        </Grid>
        <Grid item direction="column" xs={12} md={6}>
          <IndexCodesTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsFinanceConfig;
