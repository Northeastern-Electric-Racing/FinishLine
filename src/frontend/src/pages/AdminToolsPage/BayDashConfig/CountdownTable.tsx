/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useState } from 'react';
import { BayDashboardCountdown, BayDashboardCountdownCreateArgs, formatDateOnly } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import NERDeleteModal from '../../../components/NERDeleteModal';
import { NERButton } from '../../../components/NERButton';
import {
  useCreateBayDashboardCountdown,
  useDeleteBayDashboardCountdown,
  useGetBayDashboardCountdowns
} from '../../../hooks/bay-dashboard.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { pickDisplayedCountdowns } from '../../../utils/bay-dashboard-countdown.utils';
import ErrorPage from '../../ErrorPage';
import CountdownFormModal from './CountdownFormModal';

interface CountdownTableProps {
  slug: string;
}

const headerCellSx = {
  fontFamily: 'Oswald, sans-serif',
  fontSize: '1.25em',
  backgroundColor: '#ef4345',
  color: 'white',
  borderBottom: '2px solid white'
};

/**
 * Where a countdown shows up on the TV: the primary countdown is the large gauge, the secondary is the corner badge
 */
const displayLabel = (
  countdown: BayDashboardCountdown,
  displayed: { primary?: BayDashboardCountdown; secondary?: BayDashboardCountdown }
): string => {
  if (countdown === displayed.primary) return 'Primary';
  if (countdown === displayed.secondary) return 'Secondary';
  return '-';
};

/**
 * The bay dashboard's countdowns in the Admin Tools, with a button to add a new one and a trash icon to delete each
 */
const CountdownTable: React.FC<CountdownTableProps> = ({ slug }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [countdownToDelete, setCountdownToDelete] = useState<BayDashboardCountdown | undefined>(undefined);
  const { data: countdowns, isLoading, isError, error } = useGetBayDashboardCountdowns(slug);
  const { mutateAsync: createCountdown } = useCreateBayDashboardCountdown(slug);
  const {
    mutate: deleteCountdown,
    isLoading: isDeleting,
    variables: deletingCountdownId
  } = useDeleteBayDashboardCountdown(slug);
  const toast = useToast();

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !countdowns) return <LoadingIndicator />;

  const displayed = pickDisplayedCountdowns(countdowns, new Date());
  const sortedCountdowns = [...countdowns].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const handleCreate = async (countdown: BayDashboardCountdownCreateArgs) => {
    await createCountdown(countdown);
    toast.success('Successfully created countdown. The TV display has been updated.');
  };

  const handleDelete = (countdownId: string) => {
    setCountdownToDelete(undefined);
    deleteCountdown(countdownId);
  };

  return (
    <Box>
      <CountdownFormModal open={showCreateModal} handleClose={() => setShowCreateModal(false)} onSubmit={handleCreate} />
      <NERDeleteModal
        open={!!countdownToDelete}
        onHide={() => setCountdownToDelete(undefined)}
        dataType={countdownToDelete ? `countdown ${countdownToDelete.name}` : 'countdown'}
        onFormSubmit={() => {
          if (countdownToDelete) {
            handleDelete(countdownToDelete.bayDashboardCountdownId);
          }
        }}
      />
      <Table sx={{ '& td': { borderBottom: 'none' } }}>
        <TableHead>
          <TableRow>
            <TableCell align="center" sx={{ ...headerCellSx, borderRadius: '10px 0px 0px 0px' }}>
              Counter
            </TableCell>
            <TableCell align="center" sx={headerCellSx}>
              Start Date
            </TableCell>
            <TableCell align="center" sx={headerCellSx}>
              End Date
            </TableCell>
            <TableCell align="center" sx={headerCellSx}>
              Display
            </TableCell>
            <TableCell align="center" sx={{ ...headerCellSx, borderRadius: '0px 10px 0px 0px' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedCountdowns.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No countdowns yet
              </TableCell>
            </TableRow>
          )}
          {sortedCountdowns.map((countdown) => (
            <TableRow key={countdown.bayDashboardCountdownId}>
              <TableCell align="center">{countdown.name}</TableCell>
              <TableCell align="center">{formatDateOnly(countdown.startDate)}</TableCell>
              <TableCell align="center">{countdown.endDate ? formatDateOnly(countdown.endDate) : '-'}</TableCell>
              <TableCell align="center">{displayLabel(countdown, displayed)}</TableCell>
              <TableCell align="center">
                <IconButton
                  type="button"
                  disabled={isDeleting && deletingCountdownId === countdown.bayDashboardCountdownId}
                  onClick={() => setCountdownToDelete(countdown)}
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <NERButton variant="contained" onClick={() => setShowCreateModal(true)}>
          New Countdown
        </NERButton>
      </Box>
    </Box>
  );
};

export default CountdownTable;
