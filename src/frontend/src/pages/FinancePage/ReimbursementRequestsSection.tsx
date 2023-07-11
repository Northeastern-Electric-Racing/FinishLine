import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { useState } from 'react';
import { ReimbursementRequest } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import { datePipe, fullNamePipe } from '../../utils/pipes';
import { createReimbursementRequestRowData } from '../../utils/finance.utils';
import ColumnHeader from './FinanceComponents/ColumnHeader';
import FinanceTabs from './FinanceComponents/FinanceTabs';

interface ReimbursementRequestTableProps {
  userReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
}

const ReimbursementRequestTable = ({
  userReimbursementRequests,
  allReimbursementRequests
}: ReimbursementRequestTableProps) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const user = useCurrentUser();

  const displayedReimbursementRequests =
    tabValue === 1 && allReimbursementRequests ? allReimbursementRequests : userReimbursementRequests;

  const rows = displayedReimbursementRequests
    .map(createReimbursementRequestRowData)
    .sort((a, b) => (a.dateSubmitted > b.dateSubmitted ? -1 : 1));

  const tabs = [{ label: 'My Requests', value: 0 }];
  if (user.isFinance) tabs.push({ label: 'All Club Requests', value: 1 });

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, width: '100%', borderRadius: '8px 8px 0 0' }}>
      <FinanceTabs tabValue={tabValue} setTabValue={setTabValue} tabs={tabs} />
      <TableContainer component={Paper} sx={{ borderRadius: '0 0 8px 8px' }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {tabValue === 1 && <ColumnHeader title="Recipient" />}
              <ColumnHeader title="Sabo ID" />
              <ColumnHeader title="Amount ($)" />
              <ColumnHeader title="Date Submitted" />
              <ColumnHeader title="Date Delivered" />
              <ColumnHeader title="Status" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={`$${row.amount}-${index}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                {tabValue === 1 && <TableCell align="center">{fullNamePipe(row.submitter)}</TableCell>}
                <TableCell align="center">{row.saboId != null ? row.saboId : '-----'}</TableCell>
                <TableCell align="center">{row.amount}</TableCell>
                <TableCell align="center">{datePipe(row.dateSubmitted)}</TableCell>
                <TableCell align="center">{!!row.dateDelivered ? datePipe(row.dateDelivered) : '-----'}</TableCell>
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
