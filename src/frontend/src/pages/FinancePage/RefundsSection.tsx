import {
  AppBar,
  Box,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  linearProgressClasses,
  styled,
  useTheme
} from '@mui/material';
import { useState } from 'react';
import { useCurrentUserReimbursements } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Reimbursement, ReimbursementRequest } from 'shared';

const NERProgressBar = styled(LinearProgress)(({ theme }) => ({
  height: 20,
  borderRadius: 5,
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 200 : 800]
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#ef4345'
  }
}));

const createRefundData = (date: Date, amount: number) => {
  return { date, amount };
};

interface RefundTableProps {
  currentUserRequests: ReimbursementRequest[];
}

const Refunds = ({ currentUserRequests }: RefundTableProps) => {
  const [value, setValue] = useState(0);

  const { data, isLoading, isError, error } = useCurrentUserReimbursements();
  const theme = useTheme();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !data) return <LoadingIndicator />;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const rows = data.map((row: Reimbursement) => createRefundData(row.dateCreated, row.amount));
  const totalReceived = data.reduce((accumulator: number, currentVal: Reimbursement) => accumulator + currentVal.amount, 0);
  const totalOwed = currentUserRequests.reduce(
    (accumulator: number, currentVal: ReimbursementRequest) => accumulator + currentVal.totalCost,
    0
  );
  const percentRefunded = (totalReceived / totalOwed) * 100;

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, width: '100%', borderRadius: '8px 8px 8px 8px', boxShadow: 1 }}>
      <AppBar sx={{ borderRadius: '8px 8px 0 0' }} position="static">
        <Tabs value={value} onChange={handleChange} indicatorColor="secondary" textColor="inherit" variant="fullWidth">
          <Tab sx={{ borderRadius: '8px 8px 0 0', fontWeight: 700 }} label="My Refunds" value={0} />
          <Tab sx={{ borderRadius: '8px 8px 0 0', fontWeight: 700 }} label="All Club Refunds" value={1} />
        </Tabs>
      </AppBar>
      <Box
        sx={{
          backgroundColor: theme.palette.background.default,
          width: '100%',
          padding: '10px',
          borderRadius: '0 0 8px 8px'
        }}
      >
        <Box sx={{ padding: '30px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'horizontal', justifyContent: 'space-between', paddingX: '30px' }}>
            <Stack sx={{ alignItems: 'center' }}>
              <Typography textAlign="center" sx={{ fontWeight: 700 }}>
                Total Owed
              </Typography>
              <Typography> {`$${totalOwed}`}</Typography>
            </Stack>
            <Stack sx={{ alignItems: 'center' }}>
              <Typography textAlign="center" sx={{ fontWeight: 700 }}>
                Total Received
              </Typography>
              <Typography> {`$${totalReceived}`}</Typography>
            </Stack>
          </Box>
          <NERProgressBar sx={{ margin: '20px' }} variant="determinate" value={percentRefunded} />
          <TableContainer component={Paper}>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="center" sx={{ fontSize: '16px', fontWeight: 600 }}>
                    Date
                  </TableCell>
                  <TableCell align="center" sx={{ fontSize: '16px', fontWeight: 600 }}>
                    Amount ($)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={`${row.date}-$${row.amount}-${index}`}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell align="center">{row.date.toLocaleDateString()}</TableCell>
                    <TableCell align="center">{row.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default Refunds;
