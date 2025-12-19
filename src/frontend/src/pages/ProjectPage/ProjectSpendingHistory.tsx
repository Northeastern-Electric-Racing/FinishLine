import React, { useMemo } from 'react';
import { Box, Typography, Link, LinearProgress, Card, CardContent, Grid, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAllReimbursementRequests } from '../../hooks/finance.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';
import { WbsNumber, ReimbursementRequest, WBSElementData, equalsWbsNumber } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';

interface ProjectSpendingHistoryProps {
  wbsNum: WbsNumber;
}

const ProjectSpendingHistory: React.FC<ProjectSpendingHistoryProps> = ({ wbsNum }) => {
  const { data: allReimbursementRequests, isLoading: rrLoading, isError: rrError } = useAllReimbursementRequests();
  const { data: project, isLoading: projectLoading } = useSingleProject(wbsNum);

  const reimbursementRequests = useMemo(() => {
    if (!allReimbursementRequests || !project) return [];

    return allReimbursementRequests.filter((rr) => {
      const hasProjectProduct = rr.reimbursementProducts.some((product) => {
        const reason = product.reimbursementProductReason;
        if ((reason as WBSElementData).wbsNum) {
          return equalsWbsNumber((reason as WBSElementData).wbsNum, { ...wbsNum, workPackageNumber: 0 });
        }
        return false;
      });
      return hasProjectProduct;
    });
  }, [allReimbursementRequests, project, wbsNum]);

  const getSubmittedDate = (rr: ReimbursementRequest): Date | null => {
    const pendingFinanceStatus = rr.reimbursementStatuses?.find((status) => status.type === 'PENDING_FINANCE');
    if (pendingFinanceStatus) {
      return new Date(pendingFinanceStatus.dateCreated);
    }
    return null;
  };

  const rows = useMemo(() => {
    return reimbursementRequests.map((rr) => ({
      id: rr.reimbursementRequestId,
      submitter: `${rr.recipient?.firstName} ${rr.recipient?.lastName}` || rr.recipient?.email || 'N/A',
      description:
        rr.reimbursementProducts?.map((p) => p.name).join(', ') ||
        rr.accountCode?.name ||
        rr.vendor?.name ||
        'No description',
      dateSubmitted: getSubmittedDate(rr),
      status: rr.reimbursementStatuses?.[0]?.type || 'UNKNOWN',
      totalAmount: (rr.totalCost || 0) / 100,
      reimbursementRequestId: rr.reimbursementRequestId
    }));
  }, [reimbursementRequests]);

  const budgetInfo = useMemo(() => {
    if (!project) return null;

    const totalBudget = project.budget;
    const totalSpent = reimbursementRequests.reduce((sum, rr) => sum + (rr.totalCost || 0), 0);
    const budgetRemaining = totalBudget - totalSpent;
    const budgetUsedPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget: totalBudget / 100,
      totalSpent: totalSpent / 100,
      budgetRemaining: budgetRemaining / 100,
      budgetUsedPercentage: Math.min(budgetUsedPercentage, 100)
    };
  }, [project, reimbursementRequests]);

  const columns: GridColDef[] = [
    {
      field: 'submitter',
      headerName: 'Submitter',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Link
          href={`/finance/reimbursement-requests/${params.row.reimbursementRequestId}`}
          underline="hover"
          color="primary"
        >
          {params.value}
        </Link>
      )
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 250
    },
    {
      field: 'dateSubmitted',
      headerName: 'Date Submitted',
      flex: 1,
      minWidth: 130,
      type: 'date',
      valueFormatter: (params) => {
        return params.value ? new Date(params.value).toLocaleDateString() : '-';
      }
    },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      minWidth: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Chip
          label={params.value.replace(/_/g, ' ')}
          color={params.value === 'REIMBURSED' ? 'success' : 'warning'}
          size="small"
        />
      )
    },
    {
      field: 'totalAmount',
      headerName: 'Total Amount',
      flex: 0.7,
      minWidth: 120,
      type: 'number',
      valueFormatter: (params) => `$${params.value.toFixed(2)}`
    }
  ];

  const isLoading = rrLoading || projectLoading;

  if (isLoading) return <LoadingIndicator />;

  if (rrError) {
    return <Typography color="error">Failed to load spending history.</Typography>;
  }

  if (!reimbursementRequests.length) return <Typography>No spending history for this project.</Typography>;

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 3 }}>
        Spending History
      </Typography>

      {budgetInfo && (
        <Card sx={{ mb: 3, backgroundColor: '#2a2a2a', border: '1px solid #444' }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Budget Overview
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      Spent: ${budgetInfo.totalSpent.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Budget: ${budgetInfo.totalBudget.toFixed(2)}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={budgetInfo.budgetUsedPercentage}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#444',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 5,
                        backgroundColor:
                          budgetInfo.budgetUsedPercentage > 90
                            ? '#f44336'
                            : budgetInfo.budgetUsedPercentage > 75
                              ? '#ff9800'
                              : '#4caf50'
                      }
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>
                    Budget Remaining
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      color: budgetInfo.budgetRemaining >= 0 ? '#4caf50' : '#f44336',
                      fontWeight: 'bold'
                    }}
                  >
                    ${budgetInfo.budgetRemaining.toFixed(2)}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    ({budgetInfo.budgetUsedPercentage.toFixed(1)}% used)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSize={25}
          rowsPerPageOptions={[10, 25, 50, 100]}
          initialState={{
            sorting: {
              sortModel: [{ field: 'dateSubmitted', sort: 'desc' }]
            }
          }}
          disableSelectionOnClick
          sx={{
            border: '1px solid #444',
            '& .MuiDataGrid-cell': {
              borderColor: '#444'
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#2a2a2a',
              borderColor: '#444'
            },
            '& .MuiDataGrid-footerContainer': {
              borderColor: '#444'
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default ProjectSpendingHistory;
