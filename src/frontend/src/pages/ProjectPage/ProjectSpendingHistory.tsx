import React, { useMemo } from 'react';
import { Box, Typography, Link, LinearProgress } from '@mui/material';
import { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAllReimbursementRequests } from '../../hooks/finance.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';
import { WbsNumber, ReimbursementRequest, WBSElementData, equalsWbsNumber, ReimbursementStatusType } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import { createReimbursementRequestRowData, cleanReimbursementRequestStatus } from '../../utils/reimbursement-request.utils';
import NERDataGrid, { MapRowResult } from '../../components/NERDataGrid';
import { routes } from '../../utils/routes';
import { fullNamePipe, centsToDollar, datePipe } from '../../utils/pipes';

interface ProjectSpendingHistoryProps {
  wbsNum: WbsNumber;
}

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

const columns: GridColDef[] = [
  {
    field: 'identifier',
    headerName: 'RR #',
    flex: 0.4,
    minWidth: 80,
    renderCell: (params: GridRenderCellParams) => (
      <Link
        href={`${routes.REIMBURSEMENT_REQUESTS}/all-requests/${(params.row as any).reimbursementRequestId}`}
        underline="hover"
        color="primary"
        onClick={(e) => e.stopPropagation()}
      >
        #{params.value}
      </Link>
    )
  },
  {
    field: 'submitter',
    headerName: 'Submitter',
    flex: 1,
    minWidth: 150,
    valueGetter: (params: any) => fullNamePipe(params.row.submitter)
  },
  {
    field: 'products',
    headerName: 'Products',
    flex: 2,
    minWidth: 250,
    valueGetter: (params: any) => params.row.reimbursementProducts?.map((p: any) => p.name).join(', ') || 'No products'
  },
  {
    field: 'dateSubmitted',
    headerName: 'Date Submitted',
    flex: 0.7,
    minWidth: 130,
    valueGetter: (params: any) => datePipe(params.row.dateSubmitted)
  },
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
  },
  {
    field: 'amount',
    headerName: 'Total Amount',
    flex: 0.5,
    minWidth: 110,
    valueGetter: (params: any) => `$${centsToDollar(params.row.amount as number)}`
  }
];

const ProjectSpendingHistory: React.FC<ProjectSpendingHistoryProps> = ({ wbsNum }) => {
  const { data: allReimbursementRequests, isLoading: rrLoading, isError: rrError } = useAllReimbursementRequests();
  const { data: project, isLoading: projectLoading } = useSingleProject(wbsNum);

  const reimbursementRequests = useMemo(() => {
    if (!allReimbursementRequests || !project) return [];
    return allReimbursementRequests.filter((rr) =>
      rr.reimbursementProducts.some((product) => {
        const reason = product.reimbursementProductReason;
        if ((reason as WBSElementData).wbsNum) {
          return equalsWbsNumber((reason as WBSElementData).wbsNum, { ...wbsNum, workPackageNumber: 0 });
        }
        return false;
      })
    );
  }, [allReimbursementRequests, project, wbsNum]);

  const budgetInfo = useMemo(() => {
    if (!project) return null;
    const totalBudget = project.budget; // already in dollars
    const totalSpent = reimbursementRequests.reduce((sum, rr) => sum + (rr.totalCost || 0), 0) / 100; // cents → dollars
    const budgetRemaining = totalBudget - totalSpent;
    const budgetUsedPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    return {
      totalBudget,
      totalSpent,
      budgetRemaining,
      budgetUsedPercentage
    };
  }, [project, reimbursementRequests]);

  const mapRow = (rr: ReimbursementRequest): MapRowResult<ReimbursementRequest> => {
    const row = createReimbursementRequestRowData(rr);
    return { ...rr, ...row, id: row.id, raw: rr };
  };

  const isLoading = rrLoading || projectLoading;

  if (isLoading) return <LoadingIndicator />;
  if (rrError) return <Typography color="error">Failed to load spending history.</Typography>;
  if (!reimbursementRequests.length) return <Typography>No spending history for this project.</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
        Spending History
      </Typography>

      {budgetInfo && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Budget Overview
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="textSecondary">
              Spent: ${budgetInfo.totalSpent.toFixed(2)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Budget: ${budgetInfo.totalBudget.toFixed(2)}
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '6px',
              overflow: 'hidden'
            }}
          >
            <LinearProgress
              variant="determinate"
              value={Math.min(budgetInfo.budgetUsedPercentage, 100)}
              sx={{
                height: 28,
                borderRadius: 0,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 0,
                  backgroundColor:
                    budgetInfo.budgetUsedPercentage > 90
                      ? '#f44336'
                      : budgetInfo.budgetUsedPercentage > 75
                        ? '#ff9800'
                        : '#4caf50'
                }
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 'bold', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
              >
                {budgetInfo.budgetUsedPercentage.toFixed(1)}% used
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: budgetInfo.budgetRemaining >= 0 ? '#4caf50' : '#f44336',
                fontWeight: 'bold'
              }}
            >
              ${Math.abs(budgetInfo.budgetRemaining).toFixed(2)}{' '}
              {budgetInfo.budgetRemaining >= 0 ? 'remaining' : 'over budget'}
            </Typography>
          </Box>
        </Box>
      )}

      <NERDataGrid
        items={reimbursementRequests}
        mapRow={mapRow}
        columns={columns}
        initialSortModel={[{ field: 'identifier', sort: 'desc' }]}
        pageSizeDefault={reimbursementRequests.length || 10}
        paperSx={{ height: 'calc(100vh - 400px)' }}
        searchFilter={(term, row) => {
          const q = term.toLowerCase();
          const r = row as any;
          return (
            String(r.identifier).includes(q) ||
            fullNamePipe(r.submitter).toLowerCase().includes(q) ||
            (r.reimbursementProducts?.map((p: any) => p.name).join(', ') || '').toLowerCase().includes(q) ||
            String(r.status).toLowerCase().includes(q)
          );
        }}
      />
    </Box>
  );
};

export default ProjectSpendingHistory;
