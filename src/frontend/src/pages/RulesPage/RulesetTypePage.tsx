/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

// Landing page for the list of ruleset types
import React from 'react';
import PageLayout from '../../components/PageLayout';
import { NERButton } from '../../components/NERButton';
import { useHistory } from 'react-router-dom';
import { routes } from '../../utils/routes';
import {
  Box,
  Button,
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
  Stack
} from '@mui/material';
import { datePipe } from '../../utils/pipes';

type RulesetTypeColumnId = 'id' | 'name' | 'lastUpdated' | 'revisions' | 'actions';

interface RulesetTypeHeadCell {
  id: RulesetTypeColumnId;
  label: string;
}

// FSAE or FHE page
const RulesetTypePage: React.FC = () => {
  const theme = useTheme();
  const history = useHistory();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const headCells: readonly RulesetTypeHeadCell[] = [
    {
      id: 'name',
      label: 'Ruleset Name'
    },
    {
      id: 'lastUpdated',
      label: 'Last Updated'
    },
    {
      id: 'revisions',
      label: 'Number of Revisions'
    },
    {
      id: 'actions',
      label: 'Actions'
    }
  ];

  // Mock data for now - will be replaced with ruleset type data
  const mockRulesets = [
    { id: '1', name: 'Ruleset 1', lastUpdated: new Date('2024-01-15'), revisions: 5, actions: 'Edit' },
    { id: '2', name: 'Ruleset 2', lastUpdated: new Date('2024-01-14'), revisions: 3, actions: 'Edit' }
  ];

  return (
    <PageLayout title="RulesetTypes">
      {/* Placeholder to navigate when clicking on a ruleset type's view button*/}
      <NERButton onClick={() => history.push(`${routes.RULES}/placeholder_ruleset_id`)}>FSAE</NERButton>

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
                      {ruleset.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Last Updated:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ededed' }}>
                          {datePipe(ruleset.lastUpdated)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Revisions:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ededed' }}>
                          {ruleset.revisions}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{
                            color: '#dd514c',
                            borderColor: '#dd514c',
                            '&:hover': {
                              borderColor: '#c74340',
                              backgroundColor: 'rgba(221, 81, 76, 0.08)'
                            }
                          }}
                        >
                          Actions
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : (
            <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
              <Table aria-label="ruleset types">
                <TableHead
                  sx={{
                    backgroundColor: '#dd514c'
                  }}
                >
                  <TableRow>
                    {headCells.map((headCell) => (
                      <TableCell
                        align="center"
                        sx={{ fontSize: '16px', fontWeight: 600 }}
                        style={{ paddingLeft: '24px', paddingRight: '0px' }}
                        key={headCell.id}
                      >
                        {headCell.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody sx={{ backgroundColor: '#121313' }}>
                  {/* Table rows will go here with ruleset type data */}
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
            <Button
              className="viewButton"
              variant="contained"
              sx={{
                borderRadius: '8px',
                color: '#ededed',
                backgroundColor: '#dd514c',
                padding: { xs: '8px 16px', md: '2px 20px' },
                mb: 1,
                mr: { xs: 0, md: 2 },
                display: 'flex',
                fontSize: { xs: '14px', md: '16px' },
                fontWeight: 700,
                textTransform: 'none',
                width: { xs: '100%', sm: 'auto' },
                maxWidth: { xs: '300px', sm: 'none' },
                '&:hover': {
                  backgroundColor: '#c74340'
                }
              }}
            >
              Add Ruleset
            </Button>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default RulesetTypePage;
