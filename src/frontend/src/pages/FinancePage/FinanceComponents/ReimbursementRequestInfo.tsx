import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { isGuest, ReimbursementRequest } from 'shared';
import { ReimbursementRequestRow, ReimbursementStatusType } from 'shared/src/types/reimbursement-requests-types';
import {
  undefinedPipe,
  fullNamePipe,
  centsToDollar,
  datePipe,
  dateUndefinedPipe,
  formatSaboIdPipe
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
import { useCurrentUser } from '../../../hooks/users.hooks';
import SidePage from './SidePagePopup';
import ReimbursementRequestDetails from '../ReimbursementRequestDetailPage/ReimbursementRequestDetails';
import ReimbursementRequestForm, {
  ReimbursementRequestDataSubmission
} from '../ReimbursementRequestForm/ReimbursementRequestForm';
import { useCreateReimbursementRequest, useUploadManyReceipts } from '../../../hooks/finance.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';

interface ReimbursementRequestInfoProps {
  userReimbursementRequests: ReimbursementRequest[];
  assignedReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
  canViewAllReimbursementRequests?: boolean;
  currentTab?: number;
  searchText?: string;
  statuses?: ReimbursementStatusType[];
  startDate?: Date | null;
  endDate?: Date | null;
  onCloseSidePage: () => void;
}

interface ReimbursementTableHeadCell {
  id: keyof ReimbursementRequestRow;
  label: string;
}

const ReimbursementRequestInfo = ({
  userReimbursementRequests,
  assignedReimbursementRequests,
  allReimbursementRequests,
  canViewAllReimbursementRequests = false,
  currentTab = 0,
  searchText,
  statuses,
  startDate,
  endDate,
  onCloseSidePage
}: ReimbursementRequestInfoProps) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [isAscendingOrder, setAscendingOrder] = useState(false);
  const [orderBy, setOrderBy] = useState<keyof ReimbursementRequestRow>('identifier');
  const user = useCurrentUser();
  const [sidePageTitle, setSidePageTitle] = useState('');

  const displayedReimbursementRequests =
    canViewAllReimbursementRequests && currentTab === 1 && allReimbursementRequests
      ? allReimbursementRequests
      : currentTab === 0
        ? userReimbursementRequests
        : assignedReimbursementRequests;

  const rows = displayedReimbursementRequests
    .map(createReimbursementRequestRowData)
    .filter((row) => {
      const submitted = new Date(row.dateSubmitted);

      if (startDate && submitted < startDate) {
        return false;
      }
      if (endDate && submitted > endDate) {
        return false;
      }

      if (statuses && statuses.length > 0 && !statuses.includes(row.status)) {
        return false;
      }

      if (!searchText) {
        return true;
      }

      const query = searchText.trim().toLowerCase().split(/\s+/);
      return query.every((query) => {
        const lowercase_query = query.toLowerCase();
        // search filters
        return (
          row.status.toLowerCase().includes(lowercase_query) ||
          ('' + row.identifier).toLowerCase().includes(lowercase_query) ||
          ('' + fullNamePipe(row.submitter)).toLowerCase().includes(lowercase_query) ||
          ('' + row.identifier).toLowerCase().includes(lowercase_query) ||
          ('' + row.saboId).toLowerCase().includes(lowercase_query) ||
          ('' + datePipe(row.dateSubmitted)).toLowerCase().includes(lowercase_query) ||
          ('' + datePipe(row.dateSubmittedToSabo)).toLowerCase().includes(lowercase_query) ||
          ('$' + centsToDollar(row.amount)).toLowerCase().includes(lowercase_query)
        );
      });
    })
    .sort((a, b) => {
      switch (orderBy) {
        case 'vendor':
          return !isAscendingOrder
            ? vendorDescendingComparator(a.vendor, b.vendor)
            : -vendorDescendingComparator(a.vendor, b.vendor);
        case 'status':
          return !isAscendingOrder
            ? statusDescendingComparator(a.status, b.status)
            : -statusDescendingComparator(a.status, b.status);
        case 'submitter':
          return !isAscendingOrder
            ? submitterDescendingComparator(a.submitter, b.submitter)
            : -submitterDescendingComparator(a.submitter, b.submitter);
        default:
          return !isAscendingOrder ? descendingComparator(a, b, orderBy) : -descendingComparator(a, b, orderBy);
      }
    });

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
    },
    {
      id: 'financeMemberAssigned',
      label: 'Assigned To'
    }
  ];

  // handle pagination
  const handleChangePage = (_event: unknown, page: number) => {
    setPage(page);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value));
    setPage(0);
  };

  // calculate money
  const refundTotal = rows.reduce((sum, row) => sum + row.amount, 0);

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

  const paginatedRows = rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const [showSidePage, setShowSidePage] = useState(false);
  const [showCreateSidePage, setShowCreateSidePage] = useState(false);
  const { isLoading: receiptsIsLoading, mutateAsync: uploadReceipts } = useUploadManyReceipts();

  const openSidePage = () => {
    setShowSidePage(true);
  };

  const closeSidePage = () => {
    setShowSidePage(false);
    onCloseSidePage();
  };

  const closeCreateSidePage = () => {
    setShowCreateSidePage(false);
    onCloseSidePage();
  };

  const { isLoading: createReimbursementRequestIsLoading, mutateAsync: createReimbursementRequest } =
    useCreateReimbursementRequest();

  const onSubmitCreate = async (data: ReimbursementRequestDataSubmission): Promise<string> => {
    const reimbursementRequest = await createReimbursementRequest({ ...data, indexCodeId: data.indexCodeId! });
    await uploadReceipts({
      id: reimbursementRequest.reimbursementRequestId,
      files: data.receiptFiles.map((file) => file.file!)
    });
    closeCreateSidePage();
    return reimbursementRequest.reimbursementRequestId;
  };

  const { pathname } = useLocation();
  const urlTabInsert = pathname.includes('/all-requests') ? 'all-requests' : 'my-requests';

  if (createReimbursementRequestIsLoading || receiptsIsLoading) return <LoadingIndicator />;

  return (
    <Box sx={{ width: '100%', borderRadius: '8px 8px 0 0' }}>
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
                  (currentTab !== 0 || headCell.id !== 'submitter') &&
                  (currentTab === 1 || headCell.id !== 'financeMemberAssigned') && (
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
            {paginatedRows.map((row, index) => {
              return (
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
                  {currentTab !== 0 && <TableCell align="center">{fullNamePipe(row.submitter)}</TableCell>}
                  <TableCell align="center">{`$${centsToDollar(row.amount)}`}</TableCell>
                  <TableCell align="center">{undefinedPipe(row.identifier)}</TableCell>
                  <TableCell align="center">{formatSaboIdPipe(row.saboId)}</TableCell>
                  <TableCell align="center">{datePipe(row.dateSubmitted)}</TableCell>
                  <TableCell align="center">{dateUndefinedPipe(row.dateSubmittedToSabo)}</TableCell>
                  {currentTab === 1 && <TableCell align="center">{fullNamePipe(row.financeMemberAssigned)}</TableCell>}
                  <TableCell align="center">
                    {
                      <Button
                        className="viewButton"
                        size="small"
                        variant="contained"
                        component={RouterLink}
                        onClick={() => openSidePage()}
                        to={`${routes.REIMBURSEMENT_REQUESTS}/${urlTabInsert}/${row.id}`}
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
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <SidePage
        showPage={showSidePage}
        handleClose={closeSidePage}
        title={''}
        component={<ReimbursementRequestDetails onCloseEditPage={closeSidePage} />}
      />
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
            mb: 2,
            width: 'calc(100% - 60px)'
          }}
        />
        {(!canViewAllReimbursementRequests || currentTab === 0) && (
          <Button
            className="viewButton"
            variant="contained"
            component={RouterLink}
            onClick={() => {
              setSidePageTitle('Create Reimbursement Request');
              setShowCreateSidePage(true);
            }}
            to={routes.NEW_REIMBURSEMENT_REQUEST}
            disabled={isGuest(user.role)}
            sx={{
              borderRadius: '8px',
              color: '#ededed',
              backgroundColor: '#dd514c',
              padding: '2px 20px',
              mb: 1,
              mr: 2,
              display: 'inline-flex',
              fontSize: '20px',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#c74340'
              }
            }}
          >
            Create Request
          </Button>
        )}
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
          Total Amount: {`$${centsToDollar(refundTotal)}`}
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
      <SidePage
        showPage={showCreateSidePage}
        handleClose={closeCreateSidePage}
        title={sidePageTitle}
        component={
          <ReimbursementRequestForm submitText="Submit" submitData={onSubmitCreate} onFormExit={closeCreateSidePage} />
        }
      />
    </Box>
  );
};

export default ReimbursementRequestInfo;
