import {
  Box,
  Button,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

interface RulesetRow {
  id: string;
  fileName: string;
  dateUploaded: Date;
  percentRulesAssigned: number;
  car: number;
  isActive: boolean;
}

// empty array - real data later
const rulesetRows: RulesetRow[] = [];

// Table header configuration
const headCells = [
  { id: 'fileName', label: 'File Name' },
  { id: 'dateUploaded', label: 'Date Uploaded' },
  { id: 'percentRulesAssigned', label: '% of Rules Assigned' },
  { id: 'car', label: 'Car' },
  { id: 'isActive', label: 'Active?' },
  { id: 'actions', label: 'Actions' }
];

const RulesetTable = () => {
  // Format date helper
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
        <Table aria-label="ruleset table">
          <TableHead
            sx={{
              backgroundColor: '#dd514c' // NER red
            }}
          >
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align="center"
                  sx={{
                    color: '#fff',
                    fontWeight: 700
                  }}
                >
                  {headCell.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ backgroundColor: '#121313' }}>
            {rulesetRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#999' }}>
                  No rulesets found
                </TableCell>
              </TableRow>
            ) : (
              rulesetRows.map((row) => (
                <TableRow
                  key={row.id}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    '&:hover': { backgroundColor: '#5e5e5e' }
                  }}
                >
                  <TableCell align="center" sx={{ color: '#fff' }}>
                    {row.fileName}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff' }}>
                    {formatDate(row.dateUploaded)}
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff' }}>
                    {row.percentRulesAssigned}%
                  </TableCell>
                  <TableCell align="center" sx={{ color: '#fff' }}>
                    {row.car}
                  </TableCell>
                  <TableCell align="center">
                    <Checkbox
                      checked={row.isActive}
                      disabled // Read-only for now
                      sx={{
                        color: '#fff',
                        '&.Mui-checked': { color: '#dd514c' }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        mr: 1,
                        color: '#fff',
                        borderColor: '#fff',
                        '&:hover': { borderColor: '#dd514c', color: '#dd514c' }
                      }}
                    >
                      Edit/Assign Rules
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{
                        color: '#fff',
                        borderColor: '#fff',
                        '&:hover': { borderColor: '#dd514c', color: '#dd514c' }
                      }}
                    >
                      View Rules
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default RulesetTable;
