import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import NERFailButton from '../../../components/NERFailButton';
import NERSuccessButton from '../../../components/NERSuccessButton';
import { ScheduleSlot } from 'shared';

const headerBackground = '#ef4345';

export interface EditSeriesConfirmationModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (editAllInSeries: boolean) => void;
  affectedSlots?: ScheduleSlot[];
  originalStartTime?: Date;
  originalEndTime?: Date;
  newStartTime?: Date;
  newEndTime?: Date;
}

/**
 * Formats a date for display (e.g., "Mon, Jan 15")
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a time for display (e.g., "2:30 PM")
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Formats a time range for display (e.g., "2:30 PM - 4:00 PM")
 */
const formatTimeRange = (start: Date, end: Date): string => {
  return `${formatTime(start)} - ${formatTime(end)}`;
};

const EditSeriesConfirmationModal: React.FC<EditSeriesConfirmationModalProps> = ({
  open,
  onCancel,
  onConfirm,
  affectedSlots = [],
  originalStartTime,
  originalEndTime,
  newStartTime,
  newEndTime
}) => {
  const [editAllInSeries, setEditAllInSeries] = useState(false);

  // Calculate new times for each affected slot based on the time offset
  const affectedSlotsWithNewTimes = useMemo(() => {
    if (!originalStartTime || !originalEndTime || !newStartTime || !newEndTime) {
      return [];
    }

    // Get the new time-of-day to apply to each slot
    const newStartHours = newStartTime.getHours();
    const newStartMinutes = newStartTime.getMinutes();
    const newEndHours = newEndTime.getHours();
    const newEndMinutes = newEndTime.getMinutes();

    return affectedSlots.map((slot) => {
      const slotStart = new Date(slot.startTime);
      const slotEnd = new Date(slot.endTime);

      // Apply the time-of-day change to each slot
      const newSlotStart = new Date(slotStart);
      newSlotStart.setHours(newStartHours, newStartMinutes, 0, 0);

      const newSlotEnd = new Date(slotEnd);
      newSlotEnd.setHours(newEndHours, newEndMinutes, 0, 0);

      return {
        ...slot,
        originalStartTime: slotStart,
        originalEndTime: slotEnd,
        newStartTime: newSlotStart,
        newEndTime: newSlotEnd
      };
    });
  }, [affectedSlots, originalStartTime, originalEndTime, newStartTime, newEndTime]);

  const handleConfirm = () => {
    onConfirm(editAllInSeries);
    setEditAllInSeries(false);
  };

  const handleCancel = () => {
    onCancel();
    setEditAllInSeries(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      PaperProps={{
        style: { borderRadius: '10px', maxWidth: '550px' }
      }}
    >
      <DialogTitle sx={{ backgroundColor: headerBackground, minHeight: '64px' }}>Edit Time</DialogTitle>
      <DialogContent sx={{ paddingTop: '20px !important' }}>
        <Typography sx={{ mb: 2 }}>
          You have changed the time for this event. Would you like to apply this change to all events in this series?
        </Typography>
        <FormControl component="fieldset">
          <RadioGroup value={editAllInSeries} onChange={(e) => setEditAllInSeries(e.target.value === 'true')}>
            <FormControlLabel
              value={false}
              control={<Radio sx={{ '&.Mui-checked': { color: '#ef4345' } }} />}
              label="This event only"
            />
            <FormControlLabel
              value={true}
              control={<Radio sx={{ '&.Mui-checked': { color: '#ef4345' } }} />}
              label={`All events in the series (${affectedSlots.length + 1} events)`}
            />
          </RadioGroup>
        </FormControl>

        {/* Show affected events when "all events in series" is selected */}
        {editAllInSeries && affectedSlotsWithNewTimes.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600, color: 'text.secondary' }}>
              The following events will also be updated:
            </Typography>
            <Box
              sx={{
                maxHeight: '200px',
                overflowY: 'auto',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 1
              }}
            >
              {affectedSlotsWithNewTimes
                .sort((a, b) => a.originalStartTime.getTime() - b.originalStartTime.getTime())
                .map((slot) => (
                  <Box
                    key={slot.scheduleSlotId}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      py: 0.75,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '&:last-child': { borderBottom: 'none' }
                    }}
                  >
                    <Typography variant="body2" sx={{ minWidth: '100px', fontWeight: 500, color: 'text.primary' }}>
                      {formatDate(slot.originalStartTime)}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#d32f2f', textDecoration: 'line-through', minWidth: '130px' }}>
                      {formatTimeRange(slot.originalStartTime, slot.originalEndTime)}
                    </Typography>
                    <ArrowForwardIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 500 }}>
                      {formatTimeRange(slot.newStartTime, slot.newEndTime)}
                    </Typography>
                  </Box>
                ))}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Box sx={{ display: 'flex', flexDirection: 'row', mb: 1 }}>
          <NERFailButton sx={{ mx: 1 }} onClick={handleCancel}>
            Cancel
          </NERFailButton>
          <NERSuccessButton sx={{ mx: 1 }} onClick={handleConfirm}>
            Confirm
          </NERSuccessButton>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default EditSeriesConfirmationModal;
