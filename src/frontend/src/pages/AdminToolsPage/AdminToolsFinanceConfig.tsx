import { Box, Typography } from '@mui/material';
import VendorsTable from './FinanceConfig/VendorsTable';
import AccountManagerTable from './FinanceConfig/AccountManagerTable';
import CategoriesTable from './FinanceConfig/CategoriesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Account Manager
      </Typography>
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}>
          <AccountManagerTable />
        </Grid>
        <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
          Categories
        </Typography>
        <Grid item direction="column" alignSelf="right" xs={12} md={6}>
          <CategoriesTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsFinanceConfig;
