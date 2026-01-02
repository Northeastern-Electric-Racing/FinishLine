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
import { useHistory, useParams } from 'react-router-dom';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { useRulesetsByType } from '../../../hooks/rules.hooks';
import { Ruleset } from 'shared';
import { routes } from '../../../utils/routes';

interface RulesetParams {
  rulesetTypeId: string;
}

const RulesetTable: React.FC = () => {
  const { rulesetTypeId } = useParams<RulesetParams>();
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Add file upload logic
  // const [AddFileModalShow, setAddFileModalShow] = React.useState(false);

  const { data: rulesets = [], isLoading, error } = useRulesetsByType(rulesetTypeId);

  // Table header configuration
  const headCells = [
    { id: 'fileName', label: 'File Name' },
    { id: 'dateUploaded', label: 'Date Uploaded' },
    { id: 'percentRulesAssigned', label: '% of Rules Assigned' },
    { id: 'car', label: 'Car' },
    { id: 'isActive', label: 'Active?' },
    { id: 'actions', label: 'Actions' }
  ];

  const handleEditRuleset = (rulesetId: string) => {
    history.push(routes.RULESET_EDIT.replace(':rulesetId', rulesetId));
  };

  const handleViewRuleset = (rulesetId: string) => {
    history.push(routes.RULESET_VIEW.replace(':rulesetId', rulesetId));
  };

  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorPage message={error.message} />;

  return (
    <Box>
      {isMobile ? (
        <Stack spacing={2} sx={{ px: 1 }}>
          {rulesets.map((ruleset: Ruleset) => (
            <Card
              key={ruleset.rulesetId}
              sx={{
                backgroundColor: '#121313',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ color: '#dd514c', fontWeight: 600, mb: 2 }}>
                  {ruleset.name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Date Uploaded:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ededed' }}>
                      {datePipe(ruleset.dateCreated)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      % of Rules Assigned:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ededed' }}>
                      {ruleset.assignedPercentage}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Car:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ededed' }}>
                      {ruleset.car.carId}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" sx={{ color: '#999' }}>
                      Active:
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#ededed' }}>
                      {ruleset.active}
                    </Typography>
                    <Checkbox
                      checked={ruleset.active}
                      disabled // Read-only for now
                      sx={{
                        color: '#fff',
                        '&.Mui-checked': { color: '#dd514c' }
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <NERButton
                      onClick={() => handleEditRuleset(ruleset.rulesetId)}
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
                      onClick={() => handleViewRuleset(ruleset.rulesetId)}
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
              {rulesets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: '#999', padding: '15px' }}>
                    No Rulesets Found
                  </TableCell>
                </TableRow>
              ) : (
                rulesets.map((ruleset: Ruleset) => (
                  <TableRow
                    key={ruleset.rulesetId}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell align="center" sx={{ maxWidth: '20vw' }}>
                      {ruleset.name}
                    </TableCell>
                    <TableCell align="center">{datePipe(ruleset.dateCreated)}</TableCell>
                    <TableCell align="center">{ruleset.assignedPercentage}%</TableCell>
                    <TableCell align="center">{ruleset.car.carId}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={ruleset.active}
                        disabled // Read-only for now
                        sx={{
                          color: '#fff',
                          '&.Mui-checked': { color: '#dd514c' }
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <NERButton
                        onClick={() => handleEditRuleset(ruleset.rulesetId)}
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
                        onClick={() => handleViewRuleset(ruleset.rulesetId)}
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
