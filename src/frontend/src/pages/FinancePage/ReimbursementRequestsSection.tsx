import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { ReimbursementRequest, isAdmin } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import {
  centsToDollar,
  codeAndRefundSourceName,
  datePipe,
  dateUndefinedPipe,
  fullNamePipe,
  undefinedPipe
} from '../../utils/pipes';
import FinanceTabs from './FinanceComponents/FinanceTabs';
import { routes } from '../../utils/routes';
import {
  descendingComparator,
  statusDescendingComparator,
  vendorDescendingComparator,
  submitterDescendingComparator,
  cleanReimbursementRequestStatus,
  createReimbursementRequestRowData
} from '../../utils/reimbursement-request.utils';
import { ReimbursementRequestRow } from 'shared/src/types/reimbursement-requests-types';
// import TableSortLabel from '@mui/material/TableSortLabel';
import ColumnHeader from './FinanceComponents/ColumnHeader';

interface ReimbursementRequestTableProps {
  userReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
}

interface ReimbursementTableHeadCell {
  id: keyof ReimbursementRequestRow;
  label: string;
}

const ReimbursementRequestTable = ({
  userReimbursementRequests,
  allReimbursementRequests
}: ReimbursementRequestTableProps) => {
  const [isAscendingOrder, setAscendingOrder] = useState(true);
  const [orderBy, setOrderBy] = useState<keyof ReimbursementRequestRow>('dateSubmittedToSabo');

  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const user = useCurrentUser();
  const canViewAllReimbursementRequests = user.isFinance || isAdmin(user.role);

  const displayedReimbursementRequests =
    tabValue === 1 && allReimbursementRequests ? allReimbursementRequests : userReimbursementRequests;

  const rows = displayedReimbursementRequests.map(createReimbursementRequestRowData).sort((a, b) => {
    if (orderBy === 'vendor') {
      return !isAscendingOrder
        ? vendorDescendingComparator(a.vendor, b.vendor)
        : -vendorDescendingComparator(a.vendor, b.vendor);
    }
    if (orderBy === 'status') {
      return !isAscendingOrder
        ? statusDescendingComparator(a.status, b.status)
        : -statusDescendingComparator(a.status, b.status);
    }
    if (orderBy === 'submitter') {
      return !isAscendingOrder
        ? submitterDescendingComparator(a.submitter, b.submitter)
        : -submitterDescendingComparator(a.submitter, b.submitter);
    }
    if (b[orderBy] === undefined) {
      return -1;
    }
    return !isAscendingOrder ? descendingComparator(a, b, orderBy) : -descendingComparator(a, b, orderBy);
  });

  const tabs = [{ label: 'My Requests', value: 0 }];
  if (canViewAllReimbursementRequests) tabs.push({ label: 'All Club Requests', value: 1 });

  const headCells: readonly ReimbursementTableHeadCell[] = [
    {
      id: 'identifier',
      label: 'ID'
    },
    {
      id: 'submitter',
      label: 'Recipient'
    },
    {
      id: 'saboId',
      label: 'SABO ID'
    },
    {
      id: 'amount',
      label: 'Amount ($)'
    },
    {
      id: 'dateSubmitted',
      label: 'Date Submitted'
    },
    {
      id: 'dateSubmittedToSabo',
      label: 'Date Submitted To SABO'
    },
    {
      id: 'vendor',
      label: 'Vendor'
    },
    {
      id: 'refundSource',
      label: 'Refund Source'
    },
    {
      id: 'status',
      label: 'Status'
    }
  ];

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, width: '100%', borderRadius: '8px 8px 0 0' }}>
      <FinanceTabs tabValue={tabValue} setTabValue={setTabValue} tabs={tabs} />
      <TableContainer component={Paper} sx={{ borderRadius: '0 0 8px 8px' }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {headCells.map(
                (headCell) =>
                  (tabValue === 1 || (headCell.id !== 'submitter' && headCell.id !== 'refundSource')) && (
                    <ColumnHeader
                      id={headCell.id}
                      title={headCell.label}
                      setAscendingOrder={setAscendingOrder}
                      isAscendingOrder={isAscendingOrder}
                      setOrderBy={setOrderBy}
                      orderBy={orderBy}
                    />
                  )
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                component={RouterLink}
                to={`${routes.REIMBURSEMENT_REQUESTS}/${row.id}`}
                key={`$${row.amount}-${index}`}
                sx={{ textDecoration: 'none', '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell align="center">{undefinedPipe(row.identifier)}</TableCell>
                {tabValue === 1 && <TableCell align="center">{fullNamePipe(row.submitter)}</TableCell>}
                <TableCell align="center">{undefinedPipe(row.saboId)}</TableCell>
                <TableCell align="center">{centsToDollar(row.amount)}</TableCell>
                <TableCell align="center">{datePipe(row.dateSubmitted)}</TableCell>
                <TableCell align="center">{dateUndefinedPipe(row.dateSubmittedToSabo)}</TableCell>
                <TableCell align="center">{row.vendor.name}</TableCell>
                {tabValue === 1 && <TableCell align="center">{codeAndRefundSourceName(row.refundSource)}</TableCell>}
                <TableCell align="center">{cleanReimbursementRequestStatus(row.status)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ReimbursementRequestTable;
