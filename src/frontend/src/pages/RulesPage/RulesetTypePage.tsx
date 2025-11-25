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
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 120px)' }}>
        <Box sx={{ flexGrow: 1 }}>
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
              <TableBody sx={{ backgroundColor: '#121313' }}>{/* Table Rows & Cells Here */}</TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box
          sx={{
            backgroundColor: '#121313',
            position: 'sticky',
            bottom: 0,
            zIndex: 2,
            width: '100%'
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
              justifyContent: 'flex-end'
            }}
          >
            <Button
              className="viewButton"
              variant="contained"
              sx={{
                borderRadius: '8px',
                color: '#ededed',
                backgroundColor: '#dd514c',
                padding: '2px 20px',
                mb: 1,
                mr: 2,
                display: 'flex',
                fontSize: '16px',
                fontWeight: 700,
                textTransform: 'none',
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
