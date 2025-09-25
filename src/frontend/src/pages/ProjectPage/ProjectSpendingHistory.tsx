import React from 'react';
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
  IconButton
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useGetMaterialsForWbsElement } from '../../hooks/bom.hooks';
import { Material, WbsNumber } from 'shared';

interface ProjectSpendingHistoryProps {
  wbsNum: WbsNumber;
}

const ProjectSpendingHistory: React.FC<ProjectSpendingHistoryProps> = ({ wbsNum }) => {
  const { data: materials, isLoading, isError } = useGetMaterialsForWbsElement(wbsNum);
  const [openRows, setOpenRows] = React.useState<Record<string, boolean>>({});

  const grouped = React.useMemo(() => {
    if (!materials) return [];
    const map: Record<string, { request: any; materials: Material[] }> = {};
    materials.forEach((mat) => {
      const rr = mat.reimbursementRequest;
      if (rr) {
        if (!map[rr.reimbursementRequestId]) {
          map[rr.reimbursementRequestId] = { request: rr, materials: [] };
        }
        map[rr.reimbursementRequestId].materials.push(mat);
      }
    });
    return Object.values(map);
  }, [materials]);

  if (isLoading) return <Typography>Loading spending history...</Typography>;
  if (isError) return <Typography color="error">Failed to load spending history.</Typography>;
  if (!grouped.length) return <Typography>No spending history for this project.</Typography>;

  const handleToggleRow = (id: string) => {
    setOpenRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
        Spending History
      </Typography>
      <TableContainer component={Paper} sx={{ background: '#232323', borderRadius: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Submitter</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total Amount</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {grouped.map(({ request, materials }) => (
              <React.Fragment key={request.reimbursementRequestId}>
                <TableRow hover>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleToggleRow(request.reimbursementRequestId)}>
                      {openRows[request.reimbursementRequestId] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell>{request.recipient?.name || request.recipient?.email || 'N/A'}</TableCell>
                  <TableCell>{new Date(request.dateCreated).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.reimbursementStatuses?.[0]?.status || 'N/A'}
                      color={request.reimbursementStatuses?.[0]?.status === 'REIMBURSED' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">${request.totalCost?.toFixed(2) || '0.00'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                    <Collapse in={openRows[request.reimbursementRequestId]} timeout="auto" unmountOnExit>
                      <Box sx={{ margin: 1, background: '#181818', borderRadius: 1, p: 2 }}>
                        <Typography variant="subtitle1" sx={{ color: 'secondary.main', mb: 1 }}>
                          Line Items
                        </Typography>
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
                                <TableCell align="right">${mat.price?.toFixed(2) || '0.00'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ProjectSpendingHistory;
