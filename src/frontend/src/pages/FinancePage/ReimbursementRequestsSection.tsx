import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { ReimbursementRequest, isAdmin, Vendor, ReimbursementStatusType } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import {
  centsToDollar,
  codeAndRefundSourceName,
  datePipe,
  dateUndefinedPipe,
  fullNamePipe,
  undefinedPipe
} from '../../utils/pipes';
import ColumnHeader from './FinanceComponents/ColumnHeader';
import FinanceTabs from './FinanceComponents/FinanceTabs';
import { routes } from '../../utils/routes';
import { cleanReimbursementRequestStatus, createReimbursementRequestRowData } from '../../utils/reimbursement-request.utils';
import TableSortLabel from '@mui/material/TableSortLabel';

interface ReimbursementRequestTableProps {
  userReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
}

type ColumnNames = 'id' | 'saboId' | 'amount' | 'dateSubmitted' | 'status' | 'dateSubmittedToSabo' | 'submitter' | 'vendor';

type Order = 'asc' | 'desc';

const ReimbursementRequestTable = ({
  userReimbursementRequests,
  allReimbursementRequests
}: ReimbursementRequestTableProps) => {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<ColumnNames>('dateSubmittedToSabo');

  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const user = useCurrentUser();
  const canViewAllReimbursementRequests = user.isFinance || isAdmin(user.role);

  const displayedReimbursementRequests =
    tabValue === 1 && allReimbursementRequests ? allReimbursementRequests : userReimbursementRequests;

  // function getComparator<Key extends keyof any>(
  //   order: Order,
  //   orderBy: Key
  // ): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
  //   return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
  // }

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function statusDescendingComparator(a: ReimbursementStatusType, b: ReimbursementStatusType): number {
    const statusOrder = new Map<ReimbursementStatusType, number>([
      [ReimbursementStatusType.PENDING_FINANCE, 1],
      [ReimbursementStatusType.SABO_SUBMITTED, 2],
      [ReimbursementStatusType.ADVISOR_APPROVED, 3],
      [ReimbursementStatusType.DENIED, 5]
    ]);

    let bConverted = statusOrder.get(b);
    let aConverted = statusOrder.get(a);

    if (bConverted !== undefined && aConverted !== undefined) {
      if (bConverted < aConverted) {
        return -1;
      }
      if (bConverted > aConverted) {
        return 1;
      }
    }
    return 0;
  }

  function vendorDescendingComparator(a: Vendor, b: Vendor): number {
    if (b.name < a.name) {
      return -1;
    }
    if (b.name > a.name) {
      return 1;
    }
    return 0;
  }

  const rows = displayedReimbursementRequests.map(createReimbursementRequestRowData).sort((a, b) => {
    if (orderBy === 'vendor') {
      return order === 'desc'
        ? vendorDescendingComparator(a.vendor, b.vendor)
        : -vendorDescendingComparator(a.vendor, b.vendor);
    }
    if (orderBy === 'status') {
      return order === 'desc'
        ? statusDescendingComparator(a.status, b.status)
        : -statusDescendingComparator(a.status, b.status);
    }
    return order === 'desc' ? descendingComparator(a, b, orderBy) : -descendingComparator(a, b, orderBy);
  });

  const tabs = [{ label: 'My Requests', value: 0 }];
  if (canViewAllReimbursementRequests) tabs.push({ label: 'All Club Requests', value: 1 });

  const handleRequestSort = (property: ColumnNames) => (event: React.MouseEvent<unknown>) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
    console.log(order, orderBy);
  };

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, width: '100%', borderRadius: '8px 8px 0 0' }}>
      <FinanceTabs tabValue={tabValue} setTabValue={setTabValue} tabs={tabs} />
      <TableContainer component={Paper} sx={{ borderRadius: '0 0 8px 8px' }}>
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              {tabValue === 1 && <ColumnHeader title="Recipient" />}
              <TableCell
                align="center"
                sx={{ fontSize: '16px', fontWeight: 600 }}
                sortDirection={orderBy === 'saboId' ? order : false}
              >
                <TableSortLabel
                  active={orderBy === 'saboId'}
                  direction={orderBy === 'saboId' ? order : 'asc'}
                  onClick={handleRequestSort('saboId')}
                >
                  Sabo ID
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: '16px', fontWeight: 600 }}
                sortDirection={orderBy === 'amount' ? order : false}
              >
                {' '}
                <TableSortLabel
                  active={orderBy === 'amount'}
                  direction={orderBy === 'amount' ? order : 'asc'}
                  onClick={handleRequestSort('amount')}
                >
                  Amount ($)
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: '16px', fontWeight: 600 }}
                sortDirection={orderBy === 'dateSubmitted' ? order : false}
              >
                <TableSortLabel
                  active={orderBy === 'dateSubmitted'}
                  direction={orderBy === 'dateSubmitted' ? order : 'asc'}
                  onClick={handleRequestSort('dateSubmitted')}
                >
                  Date Submitted
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: '16px', fontWeight: 600 }}
                sortDirection={orderBy === 'dateSubmittedToSabo' ? order : false}
              >
                <TableSortLabel
                  active={orderBy === 'dateSubmittedToSabo'}
                  direction={orderBy === 'dateSubmittedToSabo' ? order : 'asc'}
                  onClick={handleRequestSort('dateSubmittedToSabo')}
                >
                  Date Submitted To Sabo
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: '16px', fontWeight: 600 }}
                sortDirection={orderBy === 'vendor' ? order : false}
              >
                <TableSortLabel
                  active={orderBy === 'vendor'}
                  direction={orderBy === 'vendor' ? order : 'asc'}
                  onClick={handleRequestSort('vendor')}
                >
                  Vendor
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontSize: '16px', fontWeight: 600 }}
                sortDirection={orderBy === 'status' ? order : false}
              >
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
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
