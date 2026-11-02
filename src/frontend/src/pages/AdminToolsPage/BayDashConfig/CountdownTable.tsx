/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Box, Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import { useState } from 'react';
import { BayDashboardCountdown, BayDashboardCountdownCreateArgs, formatDateOnly, isHead } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { NERButton } from '../../../components/NERButton';
import { useCreateBayDashboardCountdown, useGetBayDashboardCountdowns } from '../../../hooks/bay-dashboard.hooks';
import { useCurrentUser } from '../../../hooks/users.hooks';
import { Edit } from '@mui/icons-material';
import { useToast } from '../../../hooks/toasts.hooks';
import { pickDisplayedCountdowns } from '../../../utils/bay-dashboard-countdown.utils';
import EditCountdownModal from './EditCountdownModal';
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
 * The bay dashboard's countdowns in the Admin Tools, with a button to add a new one
 */
const CountdownTable: React.FC<CountdownTableProps> = ({ slug }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCountdown, setEditingCountdown] = useState<BayDashboardCountdown | null>(null);
  const user = useCurrentUser();
  const { data: countdowns, isLoading, isError, error } = useGetBayDashboardCountdowns(slug);
  const { mutateAsync: createCountdown } = useCreateBayDashboardCountdown(slug);
  const toast = useToast();

  if (isError) return <ErrorPage message={error.message} />;
  if (isLoading || !countdowns) return <LoadingIndicator />;

  const displayed = pickDisplayedCountdowns(countdowns, new Date());
  const sortedCountdowns = [...countdowns].sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const handleCreate = async (countdown: BayDashboardCountdownCreateArgs) => {
    await createCountdown(countdown);
    toast.success('Successfully created countdown. The TV display has been updated.');
  };

  return (
    <Box>
      <CountdownFormModal open={showCreateModal} handleClose={() => setShowCreateModal(false)} onSubmit={handleCreate} />
      {editingCountdown && (
        <EditCountdownModal
          showModal
          handleClose={() => setEditingCountdown(null)}
          countdown={editingCountdown}
          slug={slug}
        />
      )}
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
                {isHead(user.role) && (
                  <IconButton onClick={() => setEditingCountdown(countdown)}>
                    <Edit />
                  </IconButton>
                )}
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
