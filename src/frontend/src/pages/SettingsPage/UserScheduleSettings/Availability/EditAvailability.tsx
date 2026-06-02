import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { HeatmapColors, enumToArray, REVIEW_TIMES } from '../../../../utils/design-review.utils';
import { addDaysToDate, Availability, getDayOfWeek, getMostRecentAvailabilities } from 'shared';
import { datePipe } from '../../../../utils/pipes';
import NERArrows from '../../../../components/NERArrows';
import { NERButton } from '../../../../components/NERButton';
import EventTimeSlot from '../../../CalendarPage/Components/EventTimeSlot';
import { useCurrentUser, useUserIcsBusyTimes } from '../../../../hooks/users.hooks';
import { icsBusySlotsByDay, isSlotBusy } from '../../../../utils/ics.utils';
import { useToast } from '../../../../hooks/toasts.hooks';

interface EditAvailabilityProps {
  editedAvailabilities: Map<number, Availability>;
  setEditedAvailabilities: (val: Map<number, Availability>) => void;
  totalAvailabilities: Availability[];
  initialDate: Date;
  canChangeDateRange?: boolean;
  showImportedCalendarBusy?: boolean;
}

const EditAvailability: React.FC<EditAvailabilityProps> = ({
  editedAvailabilities,
  totalAvailabilities,
  setEditedAvailabilities,
  initialDate,
  canChangeDateRange = true,
  showImportedCalendarBusy = false
}) => {
  const currentUser = useCurrentUser();
  const toast = useToast();
  const [currentlyDisplayedAvailabilities, setCurrentlyDisplayedAvailabilities] = useState(() => {
    const availabilities = Array.from(editedAvailabilities.values());
    if (availabilities.length === 0) {
      const existingForWeek = getMostRecentAvailabilities(totalAvailabilities, initialDate);

      existingForWeek.forEach((availability) => {
        editedAvailabilities.set(availability.dateSet.getTime(), availability);
      });
      setEditedAvailabilities(editedAvailabilities);

      return existingForWeek;
    }
    return availabilities;
  });

  const [isDragging, setIsDragging] = useState(false);

  const weekStart = currentlyDisplayedAvailabilities[0]?.dateSet ?? initialDate;
  const weekEnd = addDaysToDate(
    currentlyDisplayedAvailabilities[currentlyDisplayedAvailabilities.length - 1]?.dateSet ?? initialDate,
    1
  );
  const { data: icsBusy, isFetching: icsBusyIsFetching } = useUserIcsBusyTimes(
    currentUser.userId,
    weekStart,
    weekEnd,
    showImportedCalendarBusy
  );

  const busyByDay = useMemo(
    () => (showImportedCalendarBusy ? icsBusySlotsByDay(icsBusy ?? []) : new Map<number, Set<number>>()),
    [icsBusy, showImportedCalendarBusy]
  );

  const handleMouseDown = (event: any, availability: Availability, selectedTime: number) => {
    event.preventDefault();
    toggleTimeSlot(availability, selectedTime);
    setIsDragging(true);
  };

  const increaseDateRange = () => {
    const lastDate = currentlyDisplayedAvailabilities[currentlyDisplayedAvailabilities.length - 1].dateSet;
    const newDate = addDaysToDate(lastDate, 1);

    const newAvailabilities = getMostRecentAvailabilities(totalAvailabilities, newDate);
    newAvailabilities.forEach((availability) => {
      const existingAvailability = editedAvailabilities.get(availability.dateSet.getTime());
      if (!existingAvailability) {
        editedAvailabilities.set(availability.dateSet.getTime(), availability);
      }
    });

    setCurrentlyDisplayedAvailabilities(getMostRecentAvailabilities(Array.from(editedAvailabilities.values()), newDate));
  };

  const decreaseDateRange = () => {
    const firstDate = currentlyDisplayedAvailabilities[0].dateSet;
    const newDate = addDaysToDate(firstDate, -7);

    const newAvailabilities = getMostRecentAvailabilities(totalAvailabilities, newDate);
    newAvailabilities.forEach((availability) => {
      const existingAvailability = editedAvailabilities.get(availability.dateSet.getTime());
      if (!existingAvailability) {
        editedAvailabilities.set(availability.dateSet.getTime(), availability);
      }
    });

    setCurrentlyDisplayedAvailabilities(getMostRecentAvailabilities(Array.from(editedAvailabilities.values()), newDate));
  };

  const handleMouseEnter = (_event: any, availability: Availability, selectedTime: number) => {
    if (!isDragging) return;
    toggleTimeSlot(availability, selectedTime);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const invertAvailabilities = () => {
    currentlyDisplayedAvailabilities.forEach((availability) =>
      enumToArray(REVIEW_TIMES).forEach((_time, timeIndex) => toggleTimeSlot(availability, timeIndex))
    );
  };

  const syncFromExternalCalendar = () => {
    const allSlots = enumToArray(REVIEW_TIMES).map((_time, timeIndex) => timeIndex);
    let busyCount = 0;

    currentlyDisplayedAvailabilities.forEach((availability) => {
      const busySlots = busyByDay.get(availability.dateSet.getTime()) ?? new Set<number>();
      busyCount += busySlots.size;
      availability.availability = allSlots.filter((slot) => !busySlots.has(slot));
      editedAvailabilities.set(availability.dateSet.getTime(), availability);
    });

    setEditedAvailabilities(editedAvailabilities);
    const currentStartDate = currentlyDisplayedAvailabilities[0]?.dateSet ?? initialDate;
    setCurrentlyDisplayedAvailabilities(
      getMostRecentAvailabilities(Array.from(editedAvailabilities.values()), currentStartDate)
    );

    toast.success(
      busyCount > 0
        ? 'Filled this week from your external calendar — adjust any slots before saving.'
        : 'No calendar conflicts found this week — marked you available across the window.'
    );
  };

  const toggleTimeSlot = (availability: Availability, selectedTime: number) => {
    availability.availability.includes(selectedTime)
      ? availability.availability.splice(availability.availability.indexOf(selectedTime), 1)
      : availability.availability.push(selectedTime);

    editedAvailabilities.set(availability.dateSet.getTime(), availability);
    setEditedAvailabilities(editedAvailabilities);

    const currentStartDate = currentlyDisplayedAvailabilities[0]?.dateSet ?? initialDate;
    setCurrentlyDisplayedAvailabilities(
      getMostRecentAvailabilities(Array.from(editedAvailabilities.values()), currentStartDate)
    );
  };

  const stickyLeft = {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    bgcolor: 'background.paper'
  };

  const isMobile = useMediaQuery('(max-width:480px)');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
        <Box>
          <Typography variant="subtitle1">Available times in green</Typography>
          {showImportedCalendarBusy && (
            <Typography variant="caption" color="text.secondary">
              Hatched slots are busy on your imported calendar. Use "Fill from external calendar" to pre-fill, then adjust
              any slots manually.
            </Typography>
          )}
        </Box>
        <Box display="flex" gap={1} flexShrink={0}>
          <Tooltip
            title={showImportedCalendarBusy ? '' : 'Connect a calendar in your user settings to use this'}
            placement="top"
          >
            <span>
              <NERButton
                variant="outlined"
                onClick={syncFromExternalCalendar}
                disabled={!showImportedCalendarBusy || icsBusyIsFetching}
              >
                {icsBusyIsFetching ? 'Filling out...' : 'Fill from external calendar'}
              </NERButton>
            </span>
          </Tooltip>
          <NERButton variant="outlined" onClick={invertAvailabilities}>
            Invert Availability
          </NERButton>
        </Box>
      </Box>

      <TableContainer
        sx={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxWidth: '100%',
          maxHeight: '100%',
          scrollSnapType: 'x mandatory',
          flex: 1
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            height: '100%',
            tableLayout: 'fixed',
            '& .MuiTableCell-head': {
              bgcolor: 'background.paper',
              px: 0.5,
              py: 0.5
            },
            '& .MuiTableCell-body': {
              px: 0,
              py: 0,
              height: `calc((100% - 50px) / 12)`
            },
            '& .MuiTableCell-root': {
              borderRight: '1px solid',
              borderColor: 'divider'
            },
            minWidth: 700
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...stickyLeft, scrollSnapAlign: 'start' }}></TableCell>
              {currentlyDisplayedAvailabilities.map((availability, idx) => (
                <TableCell key={idx} sx={{ scrollSnapAlign: 'start' }}>
                  <Typography variant="body1" align="center" fontWeight="bold" sx={{ fontSize: 15 }}>
                    {!isMobile && getDayOfWeek(availability.dateSet)}
                    {isMobile && getDayOfWeek(availability.dateSet).slice(0, 3)}
                    <br />
                    {!isMobile && datePipe(availability.dateSet)}
                    {isMobile && datePipe(availability.dateSet, false)}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {enumToArray(REVIEW_TIMES).map((time, timeIndex) => (
              <TableRow key={time}>
                <TableCell sx={{ ...stickyLeft, zIndex: 1, scrollSnapAlign: 'start' }}>
                  <Typography variant="body1" align="center" sx={{ fontSize: 15 }}>
                    {time}
                  </Typography>
                </TableCell>
                {currentlyDisplayedAvailabilities.map((availability, dayIndex) => {
                  const isAvailable = availability.availability.includes(timeIndex);
                  return (
                    <TableCell key={dayIndex} sx={{ p: 0, scrollSnapAlign: 'start' }}>
                      <EventTimeSlot
                        backgroundColor={isAvailable ? HeatmapColors[3] : HeatmapColors[0]}
                        selected={false}
                        busy={isSlotBusy(busyByDay, availability.dateSet, timeIndex)}
                        onMouseDown={(e) => handleMouseDown(e, availability, timeIndex)}
                        onMouseEnter={(e) => handleMouseEnter(e, availability, timeIndex)}
                        onMouseUp={handleMouseUp}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {canChangeDateRange && (
        <Box display="flex" justifyContent="center" width="100%" mt={2}>
          <NERArrows onLeftArrowPressed={decreaseDateRange} onRightArrowPressed={increaseDateRange} />
        </Box>
      )}
    </Box>
  );
};
export default EditAvailability;
