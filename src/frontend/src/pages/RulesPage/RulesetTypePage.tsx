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
import AddRulesetTypeModal from './components/AddRulesetTypeModal';
import { useState } from 'react';
import { useCreateRulesetType } from '../../hooks/rules.hooks';

type RulesetTypeColumnId = 'id' | 'name' | 'lastUpdated' | 'revisions' | 'actions';

interface RulesetTypeHeadCell {
  id: RulesetTypeColumnId;
  label: string;
}

// FSAE or FHE page
const RulesetTypePage: React.FC = () => {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [addRulesetTypeModalShow, setAddRulesetTypeModalShow] = useState(false);

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
  const mockRulesetTypes = [
    { id: '1', name: 'Ruleset 1', lastUpdated: new Date('2024-01-15'), revisions: 5, actions: 'Edit' },
    { id: '2', name: 'Ruleset 2', lastUpdated: new Date('2024-01-14'), revisions: 3, actions: 'Edit' }
  ];

  const { mutateAsync: createRulesetType } = useCreateRulesetType();

  const handleAddRulesetTypeConfirm = async (data: { name: string }) => {
    await createRulesetType({ name: data.name });
  };

  const handleAddRulesetTypeCancel = () => {
    setAddRulesetTypeModalShow(false);
  };

  return (
    <PageLayout title="Ruleset Types">
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
        <Box sx={{ flexGrow: 1 }}>
          {isMobile ? (
            <Stack spacing={2} sx={{ px: 1 }}>
              {mockRulesetTypes.map((rulesetType) => (
                <Card
                  key={rulesetType.id}
                  sx={{
                    backgroundColor: '#121313',
                    borderRadius: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ color: '#dd514c', fontWeight: 600, mb: 2 }}>
                      {rulesetType.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Last Updated:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ededed' }}>
                          {datePipe(rulesetType.lastUpdated)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Revisions:
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#ededed' }}>
                          {rulesetType.revisions}
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
            <NERButton variant="contained" onClick={() => setAddRulesetTypeModalShow(!addRulesetTypeModalShow)}>
              Add Ruleset Type
            </NERButton>
            <AddRulesetTypeModal
              open={addRulesetTypeModalShow}
              onHide={handleAddRulesetTypeCancel}
              onFormSubmit={handleAddRulesetTypeConfirm}
            />
            {/* Temporary for navigation */}
            <NERButton onClick={() => history.push(`${routes.RULES}/35fdd134-0ca5-4e42-a50a-3a7ebc852a74`)}>
              FSAE Ruleset
            </NERButton>
          </Box>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default RulesetTypePage;
