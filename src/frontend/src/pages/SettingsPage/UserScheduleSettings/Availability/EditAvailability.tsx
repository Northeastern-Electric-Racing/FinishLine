import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery
} from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import {
  HeatmapColors,
  enumToArray,
  REVIEW_TIMES,
  reviewTimesInCurrentTimeZone,
  yourTimeZoneInitials
} from '../../../../utils/design-review.utils';
import { addDaysToDate, Availability, getDayOfWeek, getMostRecentAvailabilities } from 'shared';
import { datePipe } from '../../../../utils/pipes';
import NERArrows from '../../../../components/NERArrows';
import { NERButton } from '../../../../components/NERButton';
import EventTimeSlot, { timeSlotCellSx } from '../../../CalendarPage/Components/EventTimeSlot';
import { useCurrentUser, useUserBusyTimes } from '../../../../hooks/users.hooks';
import { busySlotsByDay, isSlotBusy } from '../../../../utils/ics.utils';
import { useToast } from '../../../../hooks/toasts.hooks';

// Row height on phones - percentage heights collapse to nothing outside a fixed-height modal,
// and slots need to stay big enough to tap accurately.
const TOUCH_SLOT_HEIGHT = 36;

// The two grid controls only fit side by side on a phone at a smaller size
const mobileButton = { fontSize: 12, px: 1 };

// The day and time labels give up as much width as they can spare so the week fits a phone screen
const narrowLabelColumn = { width: 46, px: 0.25 };

interface EditAvailabilityProps {
  editedAvailabilities: Map<number, Availability>;
  setEditedAvailabilities: (val: Map<number, Availability>) => void;
  totalAvailabilities: Availability[];
  initialDate: Date;
  canChangeDateRange?: boolean;
}

const EditAvailability: React.FC<EditAvailabilityProps> = ({
  editedAvailabilities,
  totalAvailabilities,
  setEditedAvailabilities,
  initialDate,
  canChangeDateRange = true
}) => {
  const currentUser = useCurrentUser();
  const toast = useToast();
  const isMobile = useMediaQuery('(max-width:480px)');
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

  // 'add' fills every slot the drag passes over, 'remove' clears them - decided by the first slot pressed.
  // A ref rather than state because pointermove fires faster than re-renders.
  const dragModeRef = useRef<'add' | 'remove' | null>(null);
  const [isInverted, setIsInverted] = useState(false);

  const weekStart = currentlyDisplayedAvailabilities[0]?.dateSet ?? initialDate;
  const weekEnd = addDaysToDate(
    currentlyDisplayedAvailabilities[currentlyDisplayedAvailabilities.length - 1]?.dateSet ?? initialDate,
    1
  );
  const { data: busyTimes, isFetching: busyTimesIsFetching } = useUserBusyTimes(
    currentUser.userId,
    weekStart,
    weekEnd,
    true
  );

  const busyByDay = busySlotsByDay(busyTimes ?? []);

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

  useEffect(() => {
    const endDrag = () => {
      dragModeRef.current = null;
    };
    window.addEventListener('pointerup', endDrag);
    window.addEventListener('pointercancel', endDrag);
    return () => {
      window.removeEventListener('pointerup', endDrag);
      window.removeEventListener('pointercancel', endDrag);
    };
  }, []);

  const commitAvailabilities = () => {
    setEditedAvailabilities(editedAvailabilities);
    const currentStartDate = currentlyDisplayedAvailabilities[0]?.dateSet ?? initialDate;
    setCurrentlyDisplayedAvailabilities(
      getMostRecentAvailabilities(Array.from(editedAvailabilities.values()), currentStartDate)
    );
  };

  const invertAvailabilities = () => {
    currentlyDisplayedAvailabilities.forEach((availability) =>
      enumToArray(REVIEW_TIMES).forEach((_time, timeIndex) => toggleTimeSlot(availability, timeIndex))
    );
    setIsInverted(!isInverted);
  };

  const syncFromBusyTimes = () => {
    const allSlots = enumToArray(REVIEW_TIMES).map((_time, timeIndex) => timeIndex);
    let busyCount = 0;

    currentlyDisplayedAvailabilities.forEach((availability) => {
      const busySlots = busyByDay.get(availability.dateSet.getTime()) ?? new Set<number>();
      busyCount += busySlots.size;
      availability.availability = allSlots.filter((slot) => !busySlots.has(slot));
      editedAvailabilities.set(availability.dateSet.getTime(), availability);
    });

    commitAvailabilities();

    toast.success(
      busyCount > 0
        ? 'Filled this week from your busy times — adjust any slots before saving.'
        : 'No conflicts found this week — marked you available across the window.'
    );
  };

  const toggleTimeSlot = (availability: Availability, selectedTime: number) => {
    availability.availability.includes(selectedTime)
      ? availability.availability.splice(availability.availability.indexOf(selectedTime), 1)
      : availability.availability.push(selectedTime);

    editedAvailabilities.set(availability.dateSet.getTime(), availability);
    commitAvailabilities();
  };

  // Sets a slot to a specific state rather than flipping it, so dragging back over a slot doesn't re-toggle it
  const setSlot = (availability: Availability, selectedTime: number, available: boolean) => {
    const isAvailable = availability.availability.includes(selectedTime);
    if (isAvailable === available) return;

    if (available) {
      availability.availability.push(selectedTime);
    } else {
      availability.availability.splice(availability.availability.indexOf(selectedTime), 1);
    }

    editedAvailabilities.set(availability.dateSet.getTime(), availability);
    commitAvailabilities();
  };

  // Slots have touch-action: none, so a touch on the grid is always an edit and never the start of a scroll -
  // toggling on press is intentional, and moving the finger paints from there.
  const handlePointerDown = (event: React.PointerEvent, availability: Availability, selectedTime: number) => {
    event.preventDefault();
    const makeAvailable = !availability.availability.includes(selectedTime);
    dragModeRef.current = makeAvailable ? 'add' : 'remove';
    setSlot(availability, selectedTime, makeAvailable);
  };

  // Touch pointers stay implicitly captured by the slot first pressed, so enter events never fire on the others.
  // Find the slot under the pointer by position instead - this works the same for mouse.
  const handlePointerMove = (event: React.PointerEvent) => {
    const mode = dragModeRef.current;
    if (!mode) return;

    const cell = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-slot]');
    if (!cell) return;

    const availability = currentlyDisplayedAvailabilities[Number(cell.dataset.day)];
    if (availability) setSlot(availability, Number(cell.dataset.time), mode === 'add');
  };

  // Tapping a day header fills or clears that whole column - the touch replacement for click-and-drag
  const toggleDay = (availability: Availability) => {
    const allSlots = enumToArray(REVIEW_TIMES).map((_time, timeIndex) => timeIndex);
    const isFullyAvailable = allSlots.every((slot) => availability.availability.includes(slot));

    availability.availability = isFullyAvailable ? [] : allSlots;
    editedAvailabilities.set(availability.dateSet.getTime(), availability);
    commitAvailabilities();
  };

  // Tapping a time label fills or clears that hour across every displayed day
  const toggleTime = (selectedTime: number) => {
    const isFullyAvailable = currentlyDisplayedAvailabilities.every((availability) =>
      availability.availability.includes(selectedTime)
    );

    currentlyDisplayedAvailabilities.forEach((availability) => {
      const withoutSelectedTime = availability.availability.filter((slot) => slot !== selectedTime);
      availability.availability = isFullyAvailable ? withoutSelectedTime : [...withoutSelectedTime, selectedTime];
      editedAvailabilities.set(availability.dateSet.getTime(), availability);
    });

    commitAvailabilities();
  };

  const stickyLeft = {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    bgcolor: 'background.paper'
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100%' }}>
      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        justifyContent="space-between"
        alignItems={isMobile ? 'stretch' : 'flex-start'}
        gap={isMobile ? 1 : 0}
        mb={1}
      >
        <Box>
          <Typography variant="subtitle1" sx={isMobile ? { fontSize: 14 } : undefined}>
            Available times in
            {isInverted ? (
              <span style={{ color: HeatmapColors[0] }}> white</span>
            ) : (
              <span style={{ color: HeatmapColors[3] }}> green</span>
            )}
            . &nbsp;&nbsp; All times are in local time, {yourTimeZoneInitials()}.{' '}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isMobile
              ? 'Tap or drag across slots to toggle them, or tap a day or time label to fill that whole row or column. Hatched slots are busy on your calendar.'
              : 'Hatched slots are busy on your imported calendar or Finishline events. Use "Fill from busy times" to pre-fill, then adjust any slots manually.'}
          </Typography>
        </Box>
        <Box display="flex" gap={1} flexShrink={0}>
          <NERButton
            variant="outlined"
            onClick={syncFromBusyTimes}
            disabled={busyTimesIsFetching}
            fullWidth={isMobile}
            sx={isMobile ? mobileButton : undefined}
          >
            {busyTimesIsFetching ? 'Filling out...' : 'Fill from busy times'}
          </NERButton>
          <NERButton
            variant="outlined"
            onClick={invertAvailabilities}
            fullWidth={isMobile}
            sx={isMobile ? mobileButton : undefined}
          >
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
          scrollSnapType: isMobile ? 'none' : 'x mandatory',
          flex: 1
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            height: isMobile ? 'auto' : '100%',
            tableLayout: 'fixed',
            '& .MuiTableCell-head': {
              bgcolor: 'background.paper',
              px: isMobile ? 0.25 : 0.5,
              py: 0.5
            },
            '& .MuiTableCell-body': {
              px: 0,
              py: 0,
              height: isMobile ? TOUCH_SLOT_HEIGHT : `calc((100% - 50px) / 12)`
            },
            '& .MuiTableCell-root': {
              borderRight: '1px solid',
              borderColor: 'divider'
            },
            // on phones the week has to fit the viewport - there is nowhere to scroll sideways to
            minWidth: isMobile ? 0 : 700
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...stickyLeft, ...(isMobile && narrowLabelColumn), scrollSnapAlign: 'start' }}></TableCell>
              {currentlyDisplayedAvailabilities.map((availability, idx) => (
                <TableCell
                  key={idx}
                  onClick={() => toggleDay(availability)}
                  title="Fill or clear this whole day"
                  sx={{ scrollSnapAlign: 'start', cursor: 'pointer', userSelect: 'none' }}
                >
                  <Typography
                    variant="body1"
                    align="center"
                    fontWeight="bold"
                    sx={{ fontSize: isMobile ? 11 : 15, lineHeight: isMobile ? 1.2 : 1.5 }}
                  >
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
          <TableBody onPointerMove={handlePointerMove}>
            {enumToArray(REVIEW_TIMES).map((time, timeIndex) => (
              <TableRow key={time}>
                <TableCell
                  onClick={() => toggleTime(timeIndex)}
                  title="Fill or clear this time across every day"
                  sx={{
                    ...stickyLeft,
                    ...(isMobile && narrowLabelColumn),
                    zIndex: 1,
                    cursor: 'pointer',
                    userSelect: 'none',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <Typography
                    variant="body1"
                    align="center"
                    sx={{ fontSize: isMobile ? 10 : 15, lineHeight: isMobile ? 1.2 : 1.5 }}
                  >
                    {reviewTimesInCurrentTimeZone(time)}
                  </Typography>
                </TableCell>
                {currentlyDisplayedAvailabilities.map((availability, dayIndex) => {
                  const isAvailable = availability.availability.includes(timeIndex);
                  return (
                    <TableCell
                      key={dayIndex}
                      data-slot
                      data-day={dayIndex}
                      data-time={timeIndex}
                      // Stops the browser claiming a touch on a slot for scrolling, which would cancel the drag
                      sx={{ ...timeSlotCellSx, scrollSnapAlign: 'start', touchAction: 'none' }}
                    >
                      <EventTimeSlot
                        backgroundColor={isAvailable ? HeatmapColors[3] : HeatmapColors[0]}
                        selected={false}
                        busy={isSlotBusy(busyByDay, availability.dateSet, timeIndex)}
                        onPointerDown={(e) => handlePointerDown(e, availability, timeIndex)}
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