/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import DeleteIcon from '@mui/icons-material/Delete';
import { Box, IconButton, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { useState } from 'react';
import { BayDashboardCountdown, BayDashboardCountdownCreateArgs, formatDateOnly } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { NERButton } from '../../../components/NERButton';
import {
  useCreateBayDashboardCountdown,
  useDeleteBayDashboardCountdown,
  useGetBayDashboardCountdowns
} from '../../../hooks/bay-dashboard.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { pickDisplayedCountdowns } from '../../../utils/bay-dashboard-countdown.utils';
import ErrorPage from '../../ErrorPage';
import CountdownDeleteModal from './CountdownDeleteModal';
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

interface CountdownDeleteButtonProps {
  name: string;
  onDelete: () => void;
}

const CountdownDeleteButton: React.FC<CountdownDeleteButtonProps> = ({ name, onDelete }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteSubmit = () => {
    onDelete();
    setShowDeleteModal(false);
  };

  return (
    <>
      <IconButton type="button" onClick={() => setShowDeleteModal(true)}>
        <DeleteIcon />
      </IconButton>
      {showDeleteModal && (
        <CountdownDeleteModal name={name} onDelete={handleDeleteSubmit} onHide={() => setShowDeleteModal(false)} />
      )}
    </>
  );
};

/**
 * The bay dashboard's countdowns in the Admin Tools, with a button to add a new one and a trash icon to delete each
 */
const CountdownTable: React.FC<CountdownTableProps> = ({ slug }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { data: countdowns, isLoading, isError, error } = useGetBayDashboardCountdowns(slug);
  const { mutateAsync: createCountdown } = useCreateBayDashboardCountdown(slug);
  // the delete hook toasts the result itself, so the table only needs to trigger it
  const { mutate: deleteCountdown } = useDeleteBayDashboardCountdown(slug);
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
    deleteCountdown(countdownId);
  };

  return (
    <Box>
      <CountdownFormModal open={showCreateModal} handleClose={() => setShowCreateModal(false)} onSubmit={handleCreate} />
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
                <CountdownDeleteButton
                  name={countdown.name}
                  onDelete={() => handleDelete(countdown.bayDashboardCountdownId)}
                />
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
