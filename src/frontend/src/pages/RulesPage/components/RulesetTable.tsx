import React from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
  useTheme,
  Card,
  CardContent,
  Typography,
  Stack,
  Checkbox
} from '@mui/material';
import { datePipe } from '../../../utils/pipes';
import { NERButton } from '../../../components/NERButton';
import { useHistory } from 'react-router-dom';

interface RulesetRow {
  id: string;
  fileName: string;
  dateUploaded: Date;
  percentRulesAssigned: number;
  car: number;
  isActive: boolean;
}

const RulesetTable: React.FC = () => {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [AddFileModalShow, setAddFileModalShow] = React.useState(false);

  // Table header configuration
  const headCells = [
    { id: 'fileName', label: 'File Name' },
    { id: 'dateUploaded', label: 'Date Uploaded' },
    { id: 'percentRulesAssigned', label: '% of Rules Assigned' },
    { id: 'car', label: 'Car' },
    { id: 'isActive', label: 'Active?' },
    { id: 'actions', label: 'Actions' }
  ];

  // Mock data for now - will be replaced with ruleset data
  const mockRulesets: RulesetRow[] = [
    {
      id: '1',
      fileName: 'FSAE Original Version',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '2',
      fileName: 'FSAE Revision 1',
      dateUploaded: new Date('2025-02-25'),
      percentRulesAssigned: 10,
      car: 1,
      isActive: true
    },
    {
      id: '3',
      fileName: 'Hi',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '3',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    }
  ];

  return (
    <Box>
      {isMobile ? (
        <Stack spacing={2} sx={{ px: 1 }}>
          {mockRulesets.map((ruleset) => (
            <Card
              key={ruleset.id}
              sx={{
                backgroundColor: '#121313',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#dd514c', fontWeight: 600, mb: 2 }}>
                  {ruleset.fileName}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Date Uploaded:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ededed' }}>
                      {datePipe(ruleset.dateUploaded)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      % of Rules Assigned:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ededed' }}>
                      {ruleset.percentRulesAssigned}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Car:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ededed' }}>
                      {ruleset.car}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Active:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ededed' }}>
                      {ruleset.isActive}
                    </Typography>
                    <Checkbox
                      checked={ruleset.isActive}
                      disabled // Read-only for now
                      sx={{
                        color: '#fff',
                        '&.Mui-checked': { color: '#dd514c' }
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <NERButton
                      sx={{
                        backgroundColor: theme.palette.grey[800],
                        color: theme.palette.getContrastText(theme.palette.grey[600]),
                        '&:hover': {
                          backgroundColor: theme.palette.grey[700]
                        },
                        marginRight: '10px',
                        padding: '4px',
                        lineHeight: 1,
                        borderRadius: '6px'
                      }}
                    >
                      Edit/Assign Rules
                    </NERButton>
                    <NERButton
                      sx={{
                        backgroundColor: theme.palette.grey[800],
                        color: theme.palette.getContrastText(theme.palette.grey[600]),
                        '&:hover': {
                          backgroundColor: theme.palette.grey[700]
                        },
                        padding: '4px',
                        lineHeight: 1,
                        borderRadius: '6px'
                      }}
                    >
                      View Rules
                    </NERButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '8px', overflowY: 'auto', maxHeight: '100vh' }}>
          <Table stickyHeader aria-label="rulesets">
            <TableHead>
              <TableRow>
                {headCells.map((headCell) => (
                  <TableCell
                    align="center"
                    sx={{ fontSize: '16px', fontWeight: 600, backgroundColor: '#dd514c' }}
                    style={{ paddingLeft: '24px', paddingRight: '0px' }}
                    key={headCell.id}
                  >
                    {headCell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody sx={{ backgroundColor: '#121313' }}>
              {/* Table rows with ruleset data */}
              {mockRulesets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: '#999', padding: '15px' }}>
                    No Rulesets Found
                  </TableCell>
                </TableRow>
              ) : (
                mockRulesets.map((ruleset) => (
                  <TableRow
                    key={ruleset.id}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell align="center" sx={{ maxWidth: '20vw' }}>
                      {ruleset.fileName}
                    </TableCell>
                    <TableCell align="center">{datePipe(ruleset.dateUploaded)}</TableCell>
                    <TableCell align="center">{ruleset.percentRulesAssigned}%</TableCell>
                    <TableCell align="center">{ruleset.car}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={ruleset.isActive}
                        disabled // Read-only for now
                        sx={{
                          color: '#fff',
                          '&.Mui-checked': { color: '#dd514c' }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <NERButton
                        sx={{
                          backgroundColor: theme.palette.grey[800],
                          color: theme.palette.getContrastText(theme.palette.grey[600]),
                          '&:hover': {
                            backgroundColor: theme.palette.grey[700]
                          },
                          marginRight: '10px',
                          padding: '4px',
                          lineHeight: 1,
                          borderRadius: '6px'
                        }}
                      >
                        Edit/Assign Rules
                      </NERButton>
                      <NERButton
                        sx={{
                          backgroundColor: theme.palette.grey[800],
                          color: theme.palette.getContrastText(theme.palette.grey[600]),
                          '&:hover': {
                            backgroundColor: theme.palette.grey[700]
                          },
                          padding: '4px',
                          lineHeight: 1,
                          borderRadius: '6px'
                        }}
                      >
                        View Rules
                      </NERButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default RulesetTable;
