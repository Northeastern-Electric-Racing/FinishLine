import { Box, Grid, Typography } from '@mui/material';
import AccountCodesTable from './FinanceConfig/AccountCodesTable';

const AdminToolsFinanceConfig: React.FC = () => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom borderBottom={1} color="#ef4345" borderColor={'white'}>
        Account Manager
      </Typography>
      <Grid container spacing="3%">
        <Grid item direction="column" xs={12} md={6}></Grid>
        <Grid item direction="column" alignSelf="right" xs={12} md={6}>
          <AccountCodesTable />
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminToolsFinanceConfig;
