import {
  AppBar,
  Box,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  useTheme
} from '@mui/material';
import { useState } from 'react';
import { ReimbursementRequest, ReimbursementStatusType } from 'shared';
import { getCurrentReimbursementStatus } from '../../utils/finance.utils';
import { useCurrentUser } from '../../hooks/users.hooks';

const createRequestData = (
  amount: number,
  dateSubmitted: Date,
  status: ReimbursementStatusType,
  saboId?: number,
  dateDelivered?: Date
) => {
  return { saboId, amount, dateSubmitted, status, dateDelivered };
};

interface ReimbursementRequestTableProps {
  currentUserRequests: ReimbursementRequest[];
  allRequests?: ReimbursementRequest[];
}

const ReimbursementRequestTable = ({ currentUserRequests, allRequests }: ReimbursementRequestTableProps) => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const user = useCurrentUser();

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const rows = (value === 1 && allRequests ? allRequests : currentUserRequests).map((row: ReimbursementRequest) =>
    createRequestData(
      row.totalCost,
      row.dateCreated,
      getCurrentReimbursementStatus(row.reimbursementStatuses).type,
      row.saboId,
      row.dateDelivered
    )
  );

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, width: '100%', borderRadius: '8px 8px 0 0' }}>
      <AppBar sx={{ borderRadius: '8px 8px 0 0' }} position="static">
        <Tabs value={value} onChange={handleChange} indicatorColor="secondary" textColor="inherit" variant="fullWidth">
          <Tab
            sx={{ borderRadius: '8px 8px 0 0', fontWeight: 700, pointerEvents: user.isFinance ? 'auto' : 'none' }}
            label="My Requests"
            value={0}
          />
          {user.isFinance && (
            <Tab sx={{ borderRadius: '8px 8px 0 0', fontWeight: 700 }} label="All Club Requests" value={1} />
          )}
        </Tabs>
      </AppBar>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ fontSize: '16px', fontWeight: 600 }}>
                Sabo ID
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '16px', fontWeight: 600 }}>
                Amount ($)
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '16px', fontWeight: 600 }}>
                Date Submitted
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '16px', fontWeight: 600 }}>
                Date Delivered
              </TableCell>
              <TableCell align="center" sx={{ fontSize: '16px', fontWeight: 600 }}>
                Status
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`$${row.amount}-${index}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">{row.saboId != null ? row.saboId : '-----'}</TableCell>
                <TableCell align="center">{row.amount}</TableCell>
                <TableCell align="center">{row.dateSubmitted.toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  {!!row.dateDelivered ? row.dateDelivered?.toLocaleDateString() : '-----'}
                </TableCell>
                <TableCell align="center">{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReimbursementRequestTable;
