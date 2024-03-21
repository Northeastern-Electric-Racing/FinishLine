import { Box, Grid, Typography, useTheme } from '@mui/material';
import VendorsTable from './FinanceConfig/VendorsTable';
import AccountCodesTable from './FinanceConfig/AccountCodesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <Box padding="5px">
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
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
