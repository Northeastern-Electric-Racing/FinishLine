import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  TablePagination
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useState } from 'react';
import { ReimbursementRequest, Team, Project, isHead, isLead } from 'shared';
import { useCurrentUser } from '../../hooks/users.hooks';
import { centsToDollar, datePipe, dateUndefinedPipe, fullNamePipe, undefinedPipe } from '../../utils/pipes';
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
  allTeams?: Team[];
  allProjects?: Project[];
  searchText?: string;
}

interface ReimbursementTableHeadCell {
  id: keyof ReimbursementRequestRow;
  label: string;
}

const ReimbursementRequestTable = ({
  userReimbursementRequests,
  allReimbursementRequests,
  searchText
}: ReimbursementRequestTableProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [isAscendingOrder, setAscendingOrder] = useState(true);
  const [orderBy, setOrderBy] = useState<keyof ReimbursementRequestRow>('dateSubmittedToSabo');

  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const user = useCurrentUser();
  const canViewAllReimbursementRequests = user.isFinance || isHead(user.role) || isLead(user.role);
  // const canViewTeamReimbursements = isHead(user.role) || isLead(user.role);

  // let teamUserIds: string[] = [];
  // if (!canViewAllReimbursementRequests && canViewTeamReimbursements && allTeams) {
  //   const teamsUserIsIn = allTeams.filter((team) => team.head.userId === user.userId);

  //   teamUserIds = teamsUserIsIn.flatMap((team) => [team.head.userId, ...team.members.map((m) => m.userId)]);
  // }

  const displayedReimbursementRequests =
    tabValue === 1 && allReimbursementRequests ? allReimbursementRequests : userReimbursementRequests;

  const rows = displayedReimbursementRequests
    .map(createReimbursementRequestRowData)

    .filter((row) => {
      if (!searchText) {
        return true;
      }
      const query = searchText.toLowerCase();
      return (
        row.status.toLowerCase().includes(query) ||
        ('' + row.identifier).toLowerCase().includes(query) ||
        ('' + fullNamePipe(row.submitter)).toLowerCase().includes(query) ||
        ('' + row.identifier).toLowerCase().includes(query) ||
        ('' + row.saboId).toLowerCase().includes(query) ||
        ('' + datePipe(row.dateSubmitted)).toLowerCase().includes(query) ||
        ('' + dateUndefinedPipe(row.dateSubmittedToSabo)).toLowerCase().includes(query) ||
        ('' + centsToDollar(row.amount)).toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
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
  // if (canViewTeamReimbursements && !canViewAllReimbursementRequests) tabs.push({ label: "My Team's Requests", value: 1 });
  if (canViewAllReimbursementRequests) tabs.push({ label: 'All Club Requests', value: 1 });

  const headCells: readonly ReimbursementTableHeadCell[] = [
    {
      id: 'status',
      label: 'Status'
    },
    {
      id: 'submitter',
      label: 'Submitted By'
    },
    {
      id: 'amount',
      label: 'Amount'
    },
    {
      id: 'identifier',
      label: 'RR #'
    },
    {
      id: 'saboId',
      label: 'SABO ID'
    },
    {
      id: 'dateSubmitted',
      label: 'Date Submitted'
    },
    {
      id: 'dateSubmittedToSabo',
      label: 'Date Submitted To SABO'
    }
  ];

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'REIMBURSED':
        return '#549d49';
      case 'DENIED':
        return '#dd514c';
      case 'PENDING_FINANCE':
      case 'SABO_SUBMITTED':
      case 'PENDING_LEADERSHIP_APPROVAL':
      case 'LEADERSHIP_APPROVED':
      case 'ADVISOR_APPROVED':
        return '#997b3e';
      default:
        return '#797a7a';
    }
  };

  const getRefundTotal = rows.reduce((sum, row) => sum + row.amount, 0);

  const handleChangePage = (event: unknown, page: number) => {
    setPage(page);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ bgcolor: theme.palette.background.default, width: '100%', borderRadius: '8px 8px 0 0' }}>
      <Box
        sx={{
          width: 'fit-content'
        }}
      >
        <FinanceTabs tabValue={tabValue} setTabValue={setTabValue} tabs={tabs} />
      </Box>
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Table aria-label="simple table">
          <TableHead
            sx={{
              backgroundColor: '#dd514c'
            }}
          >
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
              <TableCell align="center" />
            </TableRow>
          </TableHead>
          <TableBody sx={{ backgroundColor: '#121313' }}>
            {paginatedRows.map((row, index) => (
              <TableRow
                key={`$${row.amount}-${index}`}
                sx={{
                  textDecoration: 'none',
                  '&:last-child td, &:last-child th': { border: 0 },
                  '&:hover .viewButton': { opacity: 1 },
                  '&:hover': { backgroundColor: '#5e5e5e' }
                }}
              >
                <TableCell align="center">
                  <Box
                    sx={{
                      padding: '3px 8px',
                      display: 'inline-flex',
                      borderRadius: '8px',
                      backgroundColor: getStatusColor(row.status),
                      fontWeight: 700
                    }}
                  >
                    {cleanReimbursementRequestStatus(row.status)}
                  </Box>
                </TableCell>
                {tabValue === 1 && <TableCell align="center">{fullNamePipe(row.submitter)}</TableCell>}
                <TableCell align="center">{`$${centsToDollar(row.amount)}`}</TableCell>
                <TableCell align="center">{undefinedPipe(row.identifier)}</TableCell>
                <TableCell align="center">{undefinedPipe(row.saboId)}</TableCell>
                <TableCell align="center">{datePipe(row.dateSubmitted)}</TableCell>
                <TableCell align="center">{dateUndefinedPipe(row.dateSubmittedToSabo)}</TableCell>
                <TableCell align="center">
                  {
                    <Button
                      className="viewButton"
                      size="small"
                      variant="contained"
                      component={RouterLink}
                      to={`${routes.REIMBURSEMENT_REQUESTS}/${row.id}`}
                      sx={{
                        borderRadius: '8px',
                        color: '#ededed',
                        backgroundColor: '#dd514c',
                        boxShadow: '0px 4px rgba(0,0,0,0.3)',
                        padding: '2px 6px',
                        opacity: 0,
                        '&:hover': {
                          backgroundColor: '#c74340'
                        }
                      }}
                    >
                      View RR
                    </Button>
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box
        sx={{
          backgroundColor: '#121313',
          position: 'fixed',
          bottom: 0,
          zIndex: 2,
          width: '100%'
        }}
      >
        <Box
          sx={{
            borderBottom: '2px solid white',
            mb: 2
          }}
        />

        <Box
          sx={{
            padding: '5px 20px',
            mb: 2,
            mr: 2,
            display: 'inline-flex',
            backgroundColor: '#3a3b3b',
            borderRadius: '8px',
            fontSize: '20px',
            fontWeight: 700
          }}
        >
          # of Requests: {rows.length}
        </Box>

        <Box
          sx={{
            padding: '5px 20px',
            mb: 2,
            display: 'inline-flex',
            backgroundColor: '#3a3b3b',
            borderRadius: '8px',
            fontSize: '20px',
            fontWeight: 700
          }}
        >
          Total Amount: {`$${centsToDollar(getRefundTotal)}`}
        </Box>
      </Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          padding: '16px 16px',
          zIndex: 3
        }}
      >
        <TablePagination
          count={rows.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelDisplayedRows={({ page }) => `Page ${page + 1}`}
        />
      </Box>
    </Box>
  );
};

export default ReimbursementRequestTable;
