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
  IconButton
} from '@mui/material';
import { useHistory } from 'react-router-dom';
import { datePipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { useAllRulesetTypes, useDeleteRulesetType } from '../../../hooks/rules.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { RulesetType } from 'shared';
import { NERButton } from '../../../components/NERButton';
import { useToast } from '../../../hooks/toasts.hooks';
import { useState } from 'react';
import RulesetTypeDeleteModal from './RulesetTypeDeleteModal';
import { Delete } from '@mui/icons-material';

type RulesetTypeColumnId = 'id' | 'name' | 'lastUpdated' | 'revisions' | 'actions' | 'delete';

interface RulesetTypeHeadCell {
  id: RulesetTypeColumnId;
  label: string;
}

interface RulesetTypeDeleteButtonProps {
  rulesetTypeId: string;
  name: string;
  onDelete: (rulesetTypeId: string, name: string) => void;
}

const RulesetTypeTable: React.FC = () => {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const toast = useToast();

  const { data: rulesetTypes = [], isLoading, error } = useAllRulesetTypes();
  const { mutateAsync: deleteRulesetType } = useDeleteRulesetType();

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
    },
    {
      id: 'delete',
      label: ''
    }
  ];

  const handleViewRulesetType = (rulesetTypeId: string) => {
    history.push(routes.RULESET_BY_ID.replace(':rulesetTypeId', rulesetTypeId));
  };

  const handleDeleteRulesetType = async (rulesetTypeId: string, name: string) => {
    const rulesetType = rulesetTypes.find((rt) => rt.rulesetTypeId === rulesetTypeId);
    if (rulesetType && rulesetType.revisionFiles.length > 0) {
      toast.error('Cannot delete ruleset type with existing revisions');
      return;
    }

    try {
      await deleteRulesetType(rulesetTypeId);
      toast.success(`Ruleset Type: ${name} deleted successfully!`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  const RulesetTypeDeleteButton: React.FC<RulesetTypeDeleteButtonProps> = ({ rulesetTypeId, name, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteSubmit = () => {
      onDelete(rulesetTypeId, name);
      setShowDeleteModal(false);
    };

    return (
      <>
        <IconButton type="button" sx={{ mx: 1 }} onClick={() => setShowDeleteModal(true)}>
          <Delete />
        </IconButton>
        {showDeleteModal && (
          <RulesetTypeDeleteModal
            rulesetTypeName={name}
            onDelete={handleDeleteSubmit}
            onHide={() => setShowDeleteModal(false)}
          />
        )}
      </>
    );
  };

  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorPage message={error.message} />;

  return (
    <Box>
      {isMobile ? (
        <Stack spacing={2} sx={{ px: 1 }}>
          {rulesetTypes.map((rulesetType: RulesetType) => (
            <Card
              key={rulesetType.rulesetTypeId}
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
                      {rulesetType.revisionFiles.length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
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
                      onClick={() => handleViewRulesetType(rulesetType.rulesetTypeId)}
                    >
                      View Rulesets
                    </NERButton>
                    <RulesetTypeDeleteButton
                      rulesetTypeId={rulesetType.rulesetTypeId}
                      name={rulesetType.name}
                      onDelete={handleDeleteRulesetType}
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: '8px', overflowY: 'auto', maxHeight: '100vh' }}>
          <Table stickyHeader aria-label="ruleset types">
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
            <TableBody sx={{ backgroundColor: '#121313', '& td': { py: 2 } }}>
              {rulesetTypes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ color: '#999', padding: '15px' }}>
                    No Ruleset Types Found
                  </TableCell>
                </TableRow>
              ) : (
                rulesetTypes.map((rulesetType: RulesetType) => (
                  <TableRow
                    key={rulesetType.rulesetTypeId}
                    sx={{
                      '&:last-child td, &:last-child th': { border: 0 }
                    }}
                  >
                    <TableCell align="center" sx={{ maxWidth: '20vw' }}>
                      {rulesetType.name}
                    </TableCell>
                    <TableCell align="center">{datePipe(rulesetType.lastUpdated)}</TableCell>
                    <TableCell align="center">{rulesetType.revisionFiles.length}</TableCell>
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
                        onClick={() => handleViewRulesetType(rulesetType.rulesetTypeId)}
                      >
                        View Rulesets
                      </NERButton>
                    </TableCell>
                    <TableCell align="center" sx={{ width: '60px', paddingLeft: '0px' }}>
                      <RulesetTypeDeleteButton
                        rulesetTypeId={rulesetType.rulesetTypeId}
                        name={rulesetType.name}
                        onDelete={handleDeleteRulesetType}
                      />
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

export default RulesetTypeTable;
