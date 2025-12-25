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
  Stack,
  Link
} from '@mui/material';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { datePipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { useAllRulesetTypes } from '../../../hooks/rules.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { RulesetType } from 'shared';

type RulesetTypeColumnId = 'id' | 'name' | 'lastUpdated' | 'revisions' | 'actions';

interface RulesetTypeHeadCell {
  id: RulesetTypeColumnId;
  label: string;
}

const RulesetTypeTable: React.FC = () => {
  const history = useHistory();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { data: rulesetTypes = [], isLoading, error } = useAllRulesetTypes();

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

  const handleViewRuleset = (rulesetTypeId: string) => {
    history.push(routes.RULESET_BY_ID.replace(':rulesetId', rulesetTypeId));
  };

  //   if (isLoading) return <LoadingIndicator />;
  //   if (error) return <ErrorPage message={error.message} />;

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
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleViewRuleset(rulesetType.rulesetTypeId)}
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
        <Box
          sx={{
            '& .Mui-even': {
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`
            },
            '& .Mui-odd': { border: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}` }
          }}
        >
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
                {rulesetTypes.map((rulesetType: RulesetType, index: number) => (
                  <TableRow
                    key={rulesetType.rulesetTypeId}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(239, 67, 69, 0.6)'
                      }
                    }}
                    className={index % 2 === 0 ? 'Mui-even' : 'Mui-odd'}
                  >
                    <TableCell align="center" sx={{ color: '#ededed' }}>
                      <Link
                        component={RouterLink}
                        to={routes.RULESET_BY_ID.replace(':rulesetId', rulesetType.rulesetTypeId)}
                        sx={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {rulesetType.name}
                      </Link>
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#ededed' }}>
                      <Link
                        component={RouterLink}
                        to={routes.RULESET_BY_ID.replace(':rulesetId', rulesetType.rulesetTypeId)}
                        sx={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {datePipe(rulesetType.lastUpdated)}
                      </Link>
                    </TableCell>
                    <TableCell align="center" sx={{ color: '#ededed' }}>
                      <Link
                        component={RouterLink}
                        to={routes.RULESET_BY_ID.replace(':rulesetId', rulesetType.rulesetTypeId)}
                        sx={{ color: 'inherit', textDecoration: 'none' }}
                      >
                        {rulesetType.revisionFiles.length}
                      </Link>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleViewRuleset(rulesetType.rulesetTypeId)}
                        sx={{
                          color: '#dd514c',
                          borderColor: '#dd514c',
                          '&:hover': {
                            borderColor: '#c74340',
                            backgroundColor: 'rgba(221, 81, 76, 0.08)'
                          }
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default RulesetTypeTable;
