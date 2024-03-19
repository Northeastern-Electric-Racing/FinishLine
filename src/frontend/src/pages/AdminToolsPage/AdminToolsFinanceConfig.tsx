import { Box, Grid, Typography } from '@mui/material';
import VendorsTable from './FinanceConfig/VendorsTable';
import AccountCodesTable from './FinanceConfig/AccountCodesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <Box padding="5px">
      <Typography marginBottom="15px" variant="h5">
        Finance Config
      </Typography>
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}>
          <VendorsTable />
        </Grid>
        <Grid item direction="column" alignSelf="right" xs={12} md={6}>
          <AccountCodesTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsFinanceConfig;
