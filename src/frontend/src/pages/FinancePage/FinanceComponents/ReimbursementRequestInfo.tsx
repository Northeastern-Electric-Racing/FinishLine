import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { ReimbursementRequest } from 'shared';
import { ReimbursementRequestRow } from 'shared/src/types/reimbursement-requests-types';
import {
  undefinedPipe,
  fullNamePipe,
  centsToDollar,
  datePipe,
  dateUndefinedPipe,
  codeAndRefundSourceName
} from '../../../utils/pipes';
import {
  createReimbursementRequestRowData,
  vendorDescendingComparator,
  statusDescendingComparator,
  submitterDescendingComparator,
  descendingComparator,
  cleanReimbursementRequestStatus
} from '../../../utils/reimbursement-request.utils';
import { routes } from '../../../utils/routes';
import ColumnHeader from './ColumnHeader';

interface ReimbursementRequestInfoProps {
  userReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
  canViewAllReimbursementRequests?: boolean;
}

interface ReimbursementTableHeadCell {
  id: keyof ReimbursementRequestRow;
  label: string;
}

const ReimbursementRequestInfo = ({
  userReimbursementRequests,
  allReimbursementRequests,
  canViewAllReimbursementRequests = false
}: ReimbursementRequestInfoProps) => {
  // set default values for orderBy and sortBy
  if (!localStorage.getItem('orderBy')) localStorage.setItem('orderBy', 'identifier');
  if (!localStorage.getItem('sortBy')) localStorage.setItem('sortBy', 'descending');

  // set orderBy and sortBy from local storage
  const [isAscendingOrder, setAscendingOrder] = useState(localStorage.getItem('ascendingOrder') === 'ascending');
  const [orderBy, setOrderBy] = useState<keyof ReimbursementRequestRow>(
    localStorage.getItem('orderBy') as keyof ReimbursementRequestRow
  );

  const displayedReimbursementRequests =
    canViewAllReimbursementRequests && allReimbursementRequests ? allReimbursementRequests : userReimbursementRequests;

  const rows = displayedReimbursementRequests.map(createReimbursementRequestRowData).sort((a, b) => {
    // create a map of comparators
    const comparators: { [key: string]: (a: any, b: any) => number } = {
      vendor: vendorDescendingComparator,
      status: statusDescendingComparator,
      submitter: submitterDescendingComparator
    };

    // set orderBy and sortBy in local storage
    localStorage.setItem('orderBy', orderBy);
    localStorage.setItem('sortBy', isAscendingOrder ? 'ascending' : 'descending');

    // if orderBy is in comparators, use that comparator
    if (orderBy in comparators) {
      return isAscendingOrder ? -comparators[orderBy](a[orderBy], b[orderBy]) : comparators[orderBy](a[orderBy], b[orderBy]);
    }

    if (b[orderBy] === undefined) {
      return -1;
    }

    // else use default descending comparator
    return isAscendingOrder ? -descendingComparator(a, b, orderBy) : descendingComparator(a, b, orderBy);
  });

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
    <TableContainer component={Paper} sx={{ borderRadius: '0 0 8px 8px' }}>
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            {headCells.map(
              (headCell) =>
                (canViewAllReimbursementRequests || (headCell.id !== 'submitter' && headCell.id !== 'refundSource')) && (
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
              {canViewAllReimbursementRequests && <TableCell align="center">{fullNamePipe(row.submitter)}</TableCell>}
              <TableCell align="center">{undefinedPipe(row.saboId)}</TableCell>
              <TableCell align="center">{centsToDollar(row.amount)}</TableCell>
              <TableCell align="center">{datePipe(row.dateSubmitted)}</TableCell>
              <TableCell align="center">{dateUndefinedPipe(row.dateSubmittedToSabo)}</TableCell>
              <TableCell align="center">{row.vendor.name}</TableCell>
              {canViewAllReimbursementRequests && (
                <TableCell align="center">{codeAndRefundSourceName(row.refundSource)}</TableCell>
              )}
              <TableCell align="center">{cleanReimbursementRequestStatus(row.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReimbursementRequestInfo;
