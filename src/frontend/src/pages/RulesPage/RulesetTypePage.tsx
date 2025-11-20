/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import PageLayout from '../../components/PageLayout';
import { Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { RulesetTypeRow } from 'shared';

interface RulesetTypeHeadCell {
  id: keyof RulesetTypeRow;
  label: string;
}

const RulesetTypePage: React.FC = () => {
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

  return (
    <PageLayout title="Rules">
      <Box>
        <TableContainer component={Paper} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
          <Table aria-label="simple table">
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
                  >
                    {headCell.label}
                  </TableCell>
                ))}
                <TableCell align="center" />
              </TableRow>
            </TableHead>
            <TableBody sx={{ backgroundColor: '#121313' }}>
              {/* {paginatedRows.map((row, index) => {
                return (
                  <TableRow
                    key={`$${row.amount}-${index}`}
                    sx={{
                      textDecoration: 'none',
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover .viewButton': { opacity: 1 },
                      '&:hover': { backgroundColor: '#5e5e5e' }
                    }}
                  >
                    <TableCell align="center">
                      <Box
                        sx={{
                          padding: '3px 8px',
                          display: 'inline-flex',
                          borderRadius: '8px',
                          backgroundColor: getStatusColor(row.status),
                          fontWeight: 700
                        }}
                      >
                        {cleanReimbursementRequestStatus(row.status)}
                      </Box>
                    </TableCell>
                    {currentTab === 1 && <TableCell align="center">{fullNamePipe(row.submitter)}</TableCell>}
                    <TableCell align="center">{`$${centsToDollar(row.amount)}`}</TableCell>
                    <TableCell align="center">{undefinedPipe(row.identifier)}</TableCell>
                    <TableCell align="center">{undefinedPipe(row.saboId)}</TableCell>
                    <TableCell align="center">{datePipe(row.dateSubmitted)}</TableCell>
                    <TableCell align="center">{dateUndefinedPipe(row.dateSubmittedToSabo)}</TableCell>
                    <TableCell align="center">
                      {
                        <Button
                          className="viewButton"
                          size="small"
                          variant="contained"
                          component={RouterLink}
                          onClick={() => openSidePage()}
                          to={`${routes.REIMBURSEMENT_REQUESTS}/${urlTabInsert}/${row.id}`}
                          sx={{
                            borderRadius: '8px',
                            color: '#ededed',
                            backgroundColor: '#dd514c',
                            boxShadow: '0px 4px rgba(0,0,0,0.3)',
                            padding: '2px 6px',
                            opacity: 0,
                            '&:hover': {
                              backgroundColor: '#c74340'
                            }
                          }}
                        >
                          View Ruleset
                        </Button>
                      }
                    </TableCell>
                  </TableRow>
                );
              })} */}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </PageLayout>
  );
};

export default RulesetTypePage;
