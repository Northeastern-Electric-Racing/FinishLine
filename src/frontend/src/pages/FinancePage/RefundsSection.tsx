import {
  Box,
  FormControl,
  FormLabel,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme
} from '@mui/material';
import { useState } from 'react';
import { useAllReimbursements, useCurrentUserReimbursements } from '../../hooks/finance.hooks';
import ErrorPage from '../ErrorPage';
import LoadingIndicator from '../../components/LoadingIndicator';
import { Reimbursement, ReimbursementRequest } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import { centsToDollar, datePipe, fullNamePipe } from '../../utils/pipes';
import NERProgressBar from '../../components/NERProgressBar';
import ColumnHeader from './FinanceComponents/ColumnHeader';
import FinanceTabs from './FinanceComponents/FinanceTabs';
import { getRefundRowData } from '../../utils/reimbursement-request.utils';

type Order = 'asc' | 'desc'; // ascending or descending
type OrderBy = keyof { date: Date; amount: number };

const RefundHeader = ({ header, data }: { header: string; data: string }) => {
  return (
    <Stack sx={{ alignItems: 'center' }}>
      <Typography textAlign="center" sx={{ fontWeight: 700 }}>
        {header}
      </Typography>
      <Typography> {data}</Typography>
    </Stack>
  );
};

interface RefundTableProps {
  userReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
}

// determines order of array
// @param orderby - what key to order by of T
function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

// get comparator based on order
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (a: { [key in Key]: number | Date }, b: { [key in Key]: number | Date }) => number {
  return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
}

const Refunds = ({ userReimbursementRequests, allReimbursementRequests }: RefundTableProps) => {
  const [tabValue, setTabValue] = useState(0);
  const user = useCurrentUser();
  const [order, setOrder] = useState<Order>('desc');
  const [orderBy, setOrderBy] = useState<
    keyof {
      date: Date;
      amount: number;
    }
  >('date');

  const {
    data: userReimbursements,
    isLoading: userReimbursementsIsLoading,
    isError: userReimbursementsIsError,
    error: userReimbursementError
  } = useCurrentUserReimbursements();
  const {
    data: allReimbursements,
    isLoading: allReimbursementsIsLoading,
    isError: allReimbursementsIsError,
    error: allReimbursementsError
  } = useAllReimbursements();
  const theme = useTheme();

  if (user.isFinance && allReimbursementsIsError) return <ErrorPage message={allReimbursementsError?.message} />;
  if (userReimbursementsIsError) return <ErrorPage message={userReimbursementError?.message} />;
  if (
    (user.isFinance && (allReimbursementsIsLoading || !allReimbursements)) ||
    userReimbursementsIsLoading ||
    !userReimbursements
  )
    return <LoadingIndicator />;

  const displayedReimbursements = allReimbursements && tabValue === 1 ? allReimbursements : userReimbursements;
  const displayedReimbursementRequests =
    allReimbursementRequests && tabValue === 1 ? allReimbursementRequests : userReimbursementRequests;

  const rows = displayedReimbursements.map(getRefundRowData).sort(getComparator(order, orderBy));

  const totalReceived = displayedReimbursements.reduce(
    (accumulator: number, currentVal: Reimbursement) => accumulator + currentVal.amount,
    0
  );
  const currentlyOwed =
    displayedReimbursementRequests.reduce(
      (accumulator: number, currentVal: ReimbursementRequest) => accumulator + currentVal.totalCost,
      0
    ) - totalReceived;
  const percentRefunded = (totalReceived / currentlyOwed) * 100;

  const tabs = [{ label: 'My Refunds', value: 0 }];
  if (user.isFinance) tabs.push({ label: 'All Club Refunds', value: 1 });

  return (
    <Box sx={{ bgcolor: theme.palette.background.paper, width: '100%', borderRadius: '8px 8px 8px 8px', boxShadow: 1 }}>
      <FinanceTabs tabValue={tabValue} setTabValue={setTabValue} tabs={tabs} />
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          width: '100%',
          padding: '30px',
          borderRadius: '0 0 8px 8px'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'horizontal', justifyContent: 'space-between', paddingX: '30px' }}>
          <RefundHeader header="Total Received" data={`$${centsToDollar(totalReceived)}`} />
          <RefundHeader header="Currently Owed" data={`$${centsToDollar(currentlyOwed)}`} />
        </Box>
        <NERProgressBar sx={{ margin: '20px' }} variant="determinate" value={percentRefunded} />
        <TableContainer component={Paper}>
          <Table aria-label="simple table">
            <TableHead>
              <TableRow>
                <ColumnHeader title="Date Received" />
                <ColumnHeader title="Amount ($)" />
                {tabValue === 1 && <ColumnHeader title="Recipient" />}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => (
                <TableRow
                  key={`${row.date}-$${row.amount}-${index}`}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell align="center">{datePipe(row.date)}</TableCell>
                  <TableCell align="center">{centsToDollar(row.amount)}</TableCell>
                  {tabValue === 1 && <TableCell align="center">{fullNamePipe(row.recipient)}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {rows.length > 1 && (
          <Grid
            container
            rowSpacing={1}
            columnSpacing={1}
            sx={{ justifyContent: 'start', alignItems: 'start', marginTop: '10px' }}
          >
            <Grid item xs={6}>
              <FormControl fullWidth>
                <FormLabel>Column</FormLabel>
                <Select
                  value={orderBy}
                  onChange={(e) => {
                    setOrderBy(e.target.value as OrderBy);
                  }}
                >
                  <MenuItem value="date">Date Received</MenuItem>
                  <MenuItem value="amount">Amount</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <FormLabel>Direction</FormLabel>
                <Select
                  value={order}
                  onChange={(e) => {
                    setOrder(e.target.value as Order);
                  }}
                >
                  <MenuItem value="asc">Ascending</MenuItem>
                  <MenuItem value="desc">Descending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default Refunds;
