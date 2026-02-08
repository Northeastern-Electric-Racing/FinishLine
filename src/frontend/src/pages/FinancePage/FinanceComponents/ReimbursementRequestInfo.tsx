import { Box, Tooltip, IconButton } from '@mui/material';
import { useLocation, useHistory } from 'react-router-dom';
import { useState } from 'react';
import { isGuest, ReimbursementRequest } from 'shared';
import { ReimbursementProduct, ReimbursementStatusType } from 'shared';
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
  cleanReimbursementRequestStatus
} from '../../../utils/reimbursement-request.utils';
import { routes } from '../../../utils/routes';
import { useCurrentUser } from '../../../hooks/users.hooks';
import SidePage from './SidePagePopup';
import ReimbursementRequestDetails from '../ReimbursementRequestDetailPage/ReimbursementRequestDetails';
import NERDataGrid, { MapRowResult } from '../../../components/NERDataGrid';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

interface ReimbursementRequestInfoProps {
  userReimbursementRequests: ReimbursementRequest[];
  assignedReimbursementRequests: ReimbursementRequest[];
  allReimbursementRequests?: ReimbursementRequest[];
  canViewAllReimbursementRequests?: boolean;
  currentTab?: number;
  statuses?: ReimbursementStatusType[];
  startDate?: Date | null;
  endDate?: Date | null;
  onCloseSidePage: () => void;
}

const ReimbursementRequestInfo = ({
  userReimbursementRequests,
  assignedReimbursementRequests,
  allReimbursementRequests,
  canViewAllReimbursementRequests = false,
  currentTab = 0,
  statuses,
  startDate,
  endDate,
  onCloseSidePage
}: ReimbursementRequestInfoProps) => {
  const user = useCurrentUser();
  const history = useHistory();
  const { pathname } = useLocation();
  const [showSidePage, setShowSidePage] = useState(false);

  const displayedReimbursementRequests =
    canViewAllReimbursementRequests && currentTab === 1 && allReimbursementRequests
      ? allReimbursementRequests
      : currentTab === 0
        ? userReimbursementRequests
        : assignedReimbursementRequests;

  const filteredRequests = displayedReimbursementRequests.filter((request) => {
    const row = createReimbursementRequestRowData(request);
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

    return true;
  });

  const getStatusColor = (status: ReimbursementStatusType): string => {
    switch (status) {
      case 'REIMBURSED':
        return '#549d49';
      case 'DENIED':
        return '#dd514c';
      case 'PENDING_FINANCE':
      case 'SABO_SUBMITTED':
      case 'PENDING_SABO_SUBMISSION':
      case 'PENDING_LEADERSHIP_APPROVAL':
      case 'LEADERSHIP_APPROVED':
      case 'ADVISOR_APPROVED':
        return '#997b3e';
      default:
        return '#797a7a';
    }
  };

  // Define columns for the data grid
  const getColumns = (): GridColDef[] => {
    const cols: GridColDef[] = [
      {
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 220,
        renderCell: (params: GridRenderCellParams) => (
          <Box
            sx={{
              padding: '3px 8px',
              display: 'inline-flex',
              borderRadius: '8px',
              backgroundColor: getStatusColor(params.value as ReimbursementStatusType),
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            {cleanReimbursementRequestStatus(params.value as ReimbursementStatusType)}
          </Box>
        )
      }
    ];

    if (currentTab !== 0) {
      cols.push({
        field: 'submitter',
        headerName: 'Submitted By',
        flex: 0.8,
        minWidth: 150,
        valueGetter: (params: any) => fullNamePipe(params.row.submitter)
      });
    }

    cols.push(
      {
        field: 'amount',
        headerName: 'Amount',
        flex: 0.5,
        minWidth: 110,
        valueGetter: (params: any) => `$${centsToDollar(params.row.amount as number)}`
      },
      {
        field: 'products',
        headerName: 'Products Purchased',
        flex: 1,
        minWidth: 110,
        valueGetter: (params: any) =>
          params.row.reimbursementProducts.map((product: ReimbursementProduct) => product.name).join(', ')
      },
      {
        field: 'identifier',
        headerName: 'RR #',
        flex: 0.4,
        minWidth: 80,
        valueGetter: (params: any) => undefinedPipe(params.row.identifier)
      },
      {
        field: 'saboId',
        headerName: 'SABO ID',
        flex: 0.5,
        minWidth: 100,
        valueGetter: (params: any) => formatSaboIdPipe(params.row.saboId)
      },
      {
        field: 'dateSubmitted',
        headerName: 'Date Submitted',
        flex: 0.7,
        minWidth: 130,
        valueGetter: (params: any) => datePipe(params.row.dateSubmitted)
      },
      {
        field: 'dateSubmittedToSabo',
        headerName: 'Date Submitted To SABO',
        flex: 0.7,
        minWidth: 180,
        valueGetter: (params: any) => dateUndefinedPipe(params.row.dateSubmittedToSabo)
      },
      {
        field: 'description',
        headerName: 'Description',
        flex: 0.7,
        minWidth: 180,
        valueGetter: (params: any) => params.row.description,
        renderCell: (params: any) => {
          const { description } = params.row;

          if (!description || description.trim() === '') {
            return null;
          }

          return (
            <Tooltip title={description} arrow placement="left">
              <IconButton size="small" sx={{ p: 0.5, color: 'white' }}>
                <InfoOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          );
        }
      }
    );

    if (currentTab === 1) {
      cols.push({
        field: 'financeMemberAssigned',
        headerName: 'Assigned To',
        flex: 0.8,
        minWidth: 150,
        valueGetter: (params: any) => fullNamePipe(params.row.financeMemberAssigned)
      });
    }

    return cols;
  };

  const mapRow = (request: ReimbursementRequest): MapRowResult<ReimbursementRequest> => {
    const row = createReimbursementRequestRowData(request);
    return {
      ...request,
      ...row,
      id: row.id,
      raw: request
    };
  };

  const searchFilter = (term: string, row: MapRowResult<ReimbursementRequest>): boolean => {
    if (!term) return true;

    const rowData = row.raw ? createReimbursementRequestRowData(row.raw) : row;
    const query = term.trim().toLowerCase().split(/\s+/);
    return query.every((q: string) => {
      const lowercase_query = q.toLowerCase();
      return (
        (rowData as any).status.toLowerCase().includes(lowercase_query) ||
        ('' + (rowData as any).identifier).toLowerCase().includes(lowercase_query) ||
        ('' + fullNamePipe((rowData as any).submitter)).toLowerCase().includes(lowercase_query) ||
        ('' + (rowData as any).saboId).toLowerCase().includes(lowercase_query) ||
        ('' + datePipe((rowData as any).dateSubmitted)).toLowerCase().includes(lowercase_query) ||
        ('' + datePipe((rowData as any).dateSubmittedToSabo)).toLowerCase().includes(lowercase_query) ||
        ('$' + centsToDollar((rowData as any).amount)).toLowerCase().includes(lowercase_query) ||
        ('' + (rowData as any).reimbursementProducts.map((product: any) => product.name))
          .toLowerCase()
          .includes(lowercase_query) ||
        ('' + (rowData as any).description).toLowerCase().includes(lowercase_query)
      );
    });
  };
  const openSidePage = () => {
    setShowSidePage(true);
  };

  const closeSidePage = () => {
    setShowSidePage(false);
    onCloseSidePage();
  };

  const urlTabInsert = pathname.includes('/all-requests') ? 'all-requests' : 'my-requests';

  // Loading indicator not needed here anymore; creation handled on separate page.

  return (
    <>
      <NERDataGrid
        items={filteredRequests}
        mapRow={mapRow}
        columns={getColumns()}
        pageSizeDefault={10}
        rowsPerPageOptions={[10, 25, 50, 100]}
        addLabel="CREATE"
        onAdd={() => {
          if (!isGuest(user.role)) {
            history.push(routes.NEW_REIMBURSEMENT_REQUEST);
          }
        }}
        onRowClick={(request) => {
          history.push(`${routes.REIMBURSEMENT_REQUESTS}/${urlTabInsert}/${request.reimbursementRequestId}`);
          openSidePage();
        }}
        searchFilter={searchFilter}
        initialSortModel={[{ field: 'identifier', sort: 'desc' }]}
        paperSx={{
          borderRadius: '10px 10px 0 0',
          overflow: 'hidden',
          height: 'calc(100vh - 160px)', // account for title, filters, tabs, and negative tableOffset
          display: 'flex',
          flexDirection: 'column'
        }}
      />
      <SidePage showPage={showSidePage} handleClose={closeSidePage} title={''} component={<ReimbursementRequestDetails />} />
    </>
  );
};

export default ReimbursementRequestInfo;
