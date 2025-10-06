import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Collapse,
  IconButton,
  TextField,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Link
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { useGetMaterialsForWbsElement } from '../../hooks/bom.hooks';
import { useAllReimbursementRequests } from '../../hooks/finance.hooks';
import { useSingleProject } from '../../hooks/projects.hooks';
import { Material, WbsNumber, ReimbursementRequest, WBSElementData, OtherProductReason, equalsWbsNumber } from 'shared';

interface ProjectSpendingHistoryProps {
  wbsNum: WbsNumber;
}

const ProjectSpendingHistory: React.FC<ProjectSpendingHistoryProps> = ({ wbsNum }) => {
  const { data: materials, isLoading: materialsLoading, isError: materialsError } = useGetMaterialsForWbsElement(wbsNum);
  const { data: allReimbursementRequests, isLoading: rrLoading, isError: rrError } = useAllReimbursementRequests();
  const { data: project, isLoading: projectLoading } = useSingleProject(wbsNum);
  const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [submitterFilter, setSubmitterFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [amountMinFilter, setAmountMinFilter] = useState('');
  const [amountMaxFilter, setAmountMaxFilter] = useState('');

  const grouped = useMemo(() => {
    if (!allReimbursementRequests || !project) return [];
    
    // Create a map of reimbursement requests that include both:
    // 1. Requests with BOM materials for this project
    // 2. Requests with products linked directly to this project
    const requestMap = new Map<string, { request: ReimbursementRequest; materials: Material[] }>();
    
    // First, add reimbursement requests from BOM materials
    if (materials) {
      materials.forEach((mat) => {
        const rr = mat.reimbursementRequest;
        if (rr) {
          if (!requestMap.has(rr.reimbursementRequestId)) {
            requestMap.set(rr.reimbursementRequestId, { request: rr, materials: [] });
          }
          requestMap.get(rr.reimbursementRequestId)!.materials.push(mat);
        }
      });
    }
    
    // Then, add standalone reimbursement requests linked to this project
    allReimbursementRequests.forEach((rr) => {
      const hasProjectProduct = rr.reimbursementProducts.some((product) => {
        const reason = product.reimbursementProductReason;
        // Check if it's a WBS element and matches our project
        if ((reason as WBSElementData).wbsNum) {
          return equalsWbsNumber(
            { ...(reason as WBSElementData).wbsNum, workPackageNumber: 0 }, // Convert to project WBS
            wbsNum
          );
        }
        return false;
      });
      
      if (hasProjectProduct && !requestMap.has(rr.reimbursementRequestId)) {
        requestMap.set(rr.reimbursementRequestId, { request: rr, materials: [] });
      }
    });
    
    return Array.from(requestMap.values());
  }, [materials, allReimbursementRequests, project, wbsNum]);

  // Filter the grouped data
  const filteredData = useMemo(() => {
    return grouped.filter(({ request }) => {
      // Submitter filter
      if (submitterFilter) {
        const submitterName = `${request.recipient?.firstName} ${request.recipient?.lastName}` || request.recipient?.email || '';
        if (!submitterName.toLowerCase().includes(submitterFilter.toLowerCase())) {
          return false;
        }
      }

      // Status filter
      if (statusFilter) {
        const currentStatus = request.reimbursementStatuses?.[0]?.type || '';
        if (currentStatus !== statusFilter) {
          return false;
        }
      }

      // Date range filter
      const requestDate = new Date(request.dateCreated);
      if (dateFromFilter) {
        const fromDate = new Date(dateFromFilter);
        if (requestDate < fromDate) {
          return false;
        }
      }
      if (dateToFilter) {
        const toDate = new Date(dateToFilter);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (requestDate > toDate) {
          return false;
        }
      }

      // Amount range filter
      const amount = (request.totalCost || 0) / 100;
      if (amountMinFilter) {
        const minAmount = parseFloat(amountMinFilter);
        if (!isNaN(minAmount) && amount < minAmount) {
          return false;
        }
      }
      if (amountMaxFilter) {
        const maxAmount = parseFloat(amountMaxFilter);
        if (!isNaN(maxAmount) && amount > maxAmount) {
          return false;
        }
      }

      return true;
    });
  }, [grouped, submitterFilter, statusFilter, dateFromFilter, dateToFilter, amountMinFilter, amountMaxFilter]);

  // Get unique submitters and statuses for filter dropdowns
  const uniqueSubmitters = useMemo(() => {
    const submitters = new Set<string>();
    grouped.forEach(({ request }) => {
      const name = `${request.recipient?.firstName} ${request.recipient?.lastName}` || request.recipient?.email;
      if (name) submitters.add(name);
    });
    return Array.from(submitters).sort();
  }, [grouped]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set<string>();
    grouped.forEach(({ request }) => {
      const status = request.reimbursementStatuses?.[0]?.type;
      if (status) statuses.add(status);
    });
    return Array.from(statuses).sort();
  }, [grouped]);

  const clearFilters = () => {
    setSubmitterFilter('');
    setStatusFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setAmountMinFilter('');
    setAmountMaxFilter('');
  };

  const hasActiveFilters =
    submitterFilter || statusFilter || dateFromFilter || dateToFilter || amountMinFilter || amountMaxFilter;

  const isLoading = materialsLoading || rrLoading || projectLoading;
  const isError = materialsError || rrError;

  if (isLoading) return <Typography>Loading spending history...</Typography>;
  if (isError) return <Typography color="error">Failed to load spending history.</Typography>;
  if (!grouped.length) return <Typography>No spending history for this project.</Typography>;

  const handleToggleRow = (id: string) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          Spending History
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {hasActiveFilters && (
            <Typography variant="caption" color="secondary">
              {filteredData.length} of {grouped.length} results
            </Typography>
          )}
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            size="small"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          {hasActiveFilters && (
            <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={clearFilters}>
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {showFilters && (
        <Box sx={{ mb: 3, p: 2, border: '1px solid #444', borderRadius: 1, backgroundColor: '#1a1a1a' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Filter Options
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Submitter</InputLabel>
                <Select value={submitterFilter} label="Submitter" onChange={(e) => setSubmitterFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {uniqueSubmitters.map((submitter) => (
                    <MenuItem key={submitter} value={submitter}>
                      {submitter}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                  <MenuItem value="">All</MenuItem>
                  {uniqueStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                type="date"
                label="From Date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                type="date"
                label="To Date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                type="number"
                label="Min Amount ($)"
                value={amountMinFilter}
                onChange={(e) => setAmountMinFilter(e.target.value)}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                size="small"
                fullWidth
                type="number"
                label="Max Amount ($)"
                value={amountMaxFilter}
                onChange={(e) => setAmountMaxFilter(e.target.value)}
                inputProps={{ step: '0.01', min: '0' }}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {filteredData.length === 0 && grouped.length > 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="textSecondary">No spending history matches the current filters.</Typography>
          <Button variant="outlined" onClick={clearFilters} sx={{ mt: 1 }}>
            Clear Filters
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ background: '#232323', borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell />
                <TableCell>Submitter / RR Link</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map(({ request, materials }) => {
                return (
                  <React.Fragment key={request.reimbursementRequestId}>
                    <TableRow hover>
                      <TableCell>
                        <IconButton size="small" onClick={() => handleToggleRow(request.reimbursementRequestId)}>
                          {openRows[request.reimbursementRequestId] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Link 
                          href={`/finance/reimbursement-requests/${request.reimbursementRequestId}`}
                          underline="hover"
                          color="primary"
                        >
                          {`${request.recipient?.firstName} ${request.recipient?.lastName}` || request.recipient?.email || 'N/A'}
                        </Link>
                      </TableCell>
                      <TableCell>{new Date(request.dateCreated).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={request.reimbursementStatuses?.[0]?.type?.replace(/_/g, ' ') || 'N/A'}
                          color={request.reimbursementStatuses?.[0]?.type === 'REIMBURSED' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">${(request.totalCost / 100)?.toFixed(2) || '0.00'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                        <Collapse in={openRows[request.reimbursementRequestId]} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1, background: '#181818', borderRadius: 1, p: 2 }}>
                            <Typography variant="subtitle1" sx={{ color: 'secondary.main', mb: 1 }}>
                              Line Items
                            </Typography>
                            {materials.length > 0 ? (
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Notes</TableCell>
                                    <TableCell align="right">Amount</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {materials.map((mat) => (
                                    <TableRow key={mat.materialId}>
                                      <TableCell>{mat.name}</TableCell>
                                      <TableCell>{mat.notes || '-'}</TableCell>
                                      <TableCell align="right">${(mat.subtotal / 100)?.toFixed(2) || '0.00'}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            ) : (
                              <Typography variant="body2" color="textSecondary">
                                This reimbursement request has no associated BOM line items. 
                                It may have been created independently or with non-BOM products.
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ProjectSpendingHistory;
