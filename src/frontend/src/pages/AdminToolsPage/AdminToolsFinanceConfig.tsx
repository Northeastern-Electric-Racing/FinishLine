import { Box, Grid, Typography } from '@mui/material';
import VendorsTable from './FinanceConfig/VendorsTable';
import AccountCodesTable from './FinanceConfig/AccountCodesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Account Manager
      </Typography>
      <VendorsTable />
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Categories
      </Typography>
      <AccountCodesTable />
    </Box>
  );
};

export default AdminToolsFinanceConfig;
