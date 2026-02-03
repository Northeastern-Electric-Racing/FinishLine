/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import React from 'react';
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
import NERSuccessButton from '../../../components/NERSuccessButton';
import NERFailButton from '../../../components/NERFailButton';
import { useScheduleEvent } from '../../../hooks/calendar.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { formatTime } from '../../../utils/datetime.utils';
import { datePipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';

interface ScheduleEventModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  selectedDay: Date;
  startHour: number;
  endHour: number;
}

const ScheduleEventModal: React.FC<ScheduleEventModalProps> = ({
  open,
  onClose,
  eventId,
  eventName,
  selectedDay,
  startHour,
  endHour
}) => {
  const toast = useToast();
  const history = useHistory();
  const { mutateAsync: scheduleEvent, isLoading } = useScheduleEvent(eventId);

  // Compute the full start and end times
  const startTime = new Date(selectedDay);
  startTime.setHours(startHour, 0, 0, 0);

  const endTime = new Date(selectedDay);
  endTime.setHours(endHour, 0, 0, 0);

  const handleConfirm = async () => {
    try {
      await scheduleEvent({ startTime, endTime });
      toast.success('Event scheduled successfully!');
      onClose();
      history.push(routes.NEW_CALENDAR);
    } catch (e) {
      if (e instanceof Error) {
        toast.error(e.message);
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Schedule {eventName}</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="body1" gutterBottom>
            You are about to schedule this event for:
          </Typography>
          <Box
            sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="h6">{datePipe(selectedDay)}</Typography>
            <Typography variant="body1" color="text.secondary">
              {formatTime(startTime)} - {formatTime(endTime)}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This will change the event status to SCHEDULED and notify all members.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <NERFailButton onClick={onClose} disabled={isLoading}>
          Cancel
        </NERFailButton>
        <NERSuccessButton onClick={handleConfirm} disabled={isLoading}>
          {isLoading ? 'Scheduling...' : 'Confirm Schedule'}
        </NERSuccessButton>
      </DialogActions>
    </Dialog>
  );
};

export default ScheduleEventModal;
