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
import { useAllReimbursements, useCurrentUserReimbursements } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Reimbursement, ReimbursementRequest } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';

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
  allRequests?: ReimbursementRequest[];
}

const Refunds = ({ currentUserRequests, allRequests }: RefundTableProps) => {
  const [value, setValue] = useState(0);
  const user = useCurrentUser();

  const { data, isLoading, isError, error } = useCurrentUserReimbursements();
  const { data: allData, isLoading: allIsLoading, isError: allIsError, error: allError } = useAllReimbursements();
  const theme = useTheme();

  if (user.isFinance && allIsError) return <ErrorPage message={allError?.message} />;
  if (isError) return <ErrorPage message={error?.message} />;
  if ((user.isFinance && (allIsLoading || !allData)) || isLoading || !data) return <LoadingIndicator />;

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const rows = (allData && value === 1 ? allData : data).map((row: Reimbursement) =>
    createRefundData(row.dateCreated, row.amount)
  );
  const totalReceived = (allData && value === 1 ? allData : data).reduce(
    (accumulator: number, currentVal: Reimbursement) => accumulator + currentVal.amount,
    0
  );
  const totalOwed = (allRequests && value === 1 ? allRequests : currentUserRequests).reduce(
    (accumulator: number, currentVal: ReimbursementRequest) => accumulator + currentVal.totalCost,
    0
  );
  const percentRefunded = (totalReceived / totalOwed) * 100;

  return (
    <Box sx={{ bgcolor: theme.palette.background.paper, width: '100%', borderRadius: '8px 8px 8px 8px', boxShadow: 1 }}>
      <AppBar sx={{ borderRadius: '8px 8px 0 0' }} position="static">
        <Tabs value={value} onChange={handleChange} indicatorColor="secondary" textColor="inherit" variant="fullWidth">
          <Tab
            sx={{ borderRadius: '8px 8px 0 0', fontWeight: 700, pointerEvents: user.isFinance ? 'auto' : 'none' }}
            label="My Refunds"
            value={0}
          />
          {user.isFinance && (
            <Tab sx={{ borderRadius: '8px 8px 0 0', fontWeight: 700 }} label="All Club Refunds" value={1} />
          )}
        </Tabs>
      </AppBar>
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
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
