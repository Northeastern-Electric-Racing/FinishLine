/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useHistory, useParams } from 'react-router-dom';
import { routes } from '../../utils/routes';
import React from 'react';

import { useToast } from '../../hooks/toasts.hooks';
import { useCreateRuleset, useParseRuleset } from '../../hooks/rules.hooks';

import { NERButton } from '../../components/NERButton';
import AddNewFileModal from './components/AddNewFileModal';
import PageLayout from '../../components/PageLayout';
import {
  Box,
  Typography,
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
  Stack,
  Checkbox
} from '@mui/material';
import { datePipe } from '../../utils/pipes';

interface RulesetRow {
  id: string;
  fileName: string;
  dateUploaded: Date;
  percentRulesAssigned: number;
  car: number;
  isActive: boolean;
}

/**
 * RulesetPage component for displaying and managing ruleset rules.
 * Supports editing and assigning rules to projects and teams.
 */
const RulesetPage: React.FC = () => {
  // ruleset from url
  const { rulesetTypeId } = useParams<{ rulesetTypeId: string }>();
  console.log('rulesetTypeId from URL:', rulesetTypeId);

  const { mutateAsync: createRuleset } = useCreateRuleset();
  const { mutateAsync: parseRuleset } = useParseRuleset();
  const toast = useToast();

  const history = useHistory();
  const [AddFileModalShow, setAddFileModalShow] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      id: '4',
      fileName: 'Hi',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '5',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '6',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '7',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '8',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '9',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '10',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '11',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '12',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '13',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '14',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '15',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '16',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    },
    {
      id: '17',
      fileName: 'Hi ',
      dateUploaded: new Date('2025-02-24'),
      percentRulesAssigned: 80,
      car: 1,
      isActive: false
    }
  ];

  const handleFileConfirm = async (data: { fileId: string; name: string; carNumber: number; parserType: string }) => {
    setAddFileModalShow(false);
    try {
      console.log('Creating ruleset...');
      console.log('rulesetTypeId value:', rulesetTypeId);
      console.log('Full payload:', {
        fileId: data.fileId,
        name: data.name,
        rulesetTypeId,
        carNumber: data.carNumber,
        active: false
      });

      const ruleset = await createRuleset({
        fileId: data.fileId,
        name: data.name,
        rulesetTypeId,
        carNumber: data.carNumber,
        active: false
      });

      console.log('Full ruleset response:', ruleset);
      console.log('Ruleset type:', typeof ruleset);
      console.log('Ruleset keys:', Object.keys(ruleset));
      console.log('Ruleset.rulesetId:', ruleset.rulesetId);
      console.log('Ruleset.id:', ruleset.rulesetId);

      const { rulesetId } = ruleset;

      if (!rulesetId) {
        console.error('No rulesetId found in response!');
        throw new Error('No rulesetId returned from createRuleset');
      }

      console.log('Parsing ruleset with ID:', rulesetId);
      const parsedRules = await parseRuleset({
        rulesetId,
        fileId: data.fileId,
        parserType: data.parserType as 'FSAE' | 'FHE'
      });
      console.log('Rules parsed:', parsedRules.length);
      toast.success(`Successfully parsed ${parsedRules.length} rules!`);
    } catch (e) {
      console.error('Error in handleFileConfirm:', e);
      toast.error('Error uploading file: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  return (
    <>
      {/* Breadcrumb Placeholder */}
      <Typography variant="body2" sx={{ color: '#999', mb: 1 }}>
        Rules / FSAE Ruleset
      </Typography>
      <PageLayout title="Rulesets">
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
          <Box sx={{ flexGrow: 1 }}>
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
          <Box
            sx={{
              backgroundColor: '#121313',
              position: 'sticky',
              bottom: 0,
              zIndex: 2,
              width: '100%',
              px: { xs: 1, md: 0 }
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
                display: 'flex',
                justifyContent: { xs: 'center', md: 'flex-end' }
              }}
            >
              {/* Add New File Button */}
              <NERButton variant="contained" onClick={() => setAddFileModalShow(!AddFileModalShow)}>
                Add New File
              </NERButton>
              <AddNewFileModal
                open={AddFileModalShow}
                onHide={() => setAddFileModalShow(false)}
                onFormSubmit={handleFileConfirm}
              />
              <NERButton onClick={() => history.push(`${routes.RULES}/placeholder_ruleset_id/edit`)}>
                MOCK edit/assign rules
              </NERButton>
            </Box>
          </Box>
        </Box>
      </PageLayout>
    </>
  );
};

export default RulesetPage;
