import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { addDaysToDate, Availability, getDayOfWeek, getMostRecentAvailabilities } from 'shared';
import { datePipe } from '../../../../utils/pipes';
import { useState, useEffect } from 'react';
import NERArrows from '../../../../components/NERArrows';
import { enumToArray, REVIEW_TIMES, getBackgroundColor } from '../../../../utils/design-review.utils';
import EventTimeSlot from '../../../CalendarPage/Components/EventTimeSlot';
import { useCurrentUser, useUserIcsBusyTimes } from '../../../../hooks/users.hooks';
import { icsBusySlotsByDay, isSlotBusy } from '../../../../utils/ics.utils';

interface SingleAvailabilityViewProps {
  totalAvailability: Availability[];
  initialDate?: Date;
  showImportedCalendarBusy?: boolean;
}

const SingleAvailabilityView: React.FC<SingleAvailabilityViewProps> = ({
  totalAvailability,
  initialDate,
  showImportedCalendarBusy = false
}) => {
  const currentUser = useCurrentUser();
  const [startDate, setStartDate] = useState<Date>(initialDate || new Date());

  useEffect(() => {
    if (initialDate) {
      setStartDate(initialDate);
    }
  }, [initialDate]);

  const selectedTimes = getMostRecentAvailabilities(totalAvailability, startDate);

  const weekStart = selectedTimes[0]?.dateSet ?? startDate;
  const weekEnd = addDaysToDate(selectedTimes[selectedTimes.length - 1]?.dateSet ?? startDate, 1);
  const { data: icsBusy } = useUserIcsBusyTimes(currentUser.userId, weekStart, weekEnd, showImportedCalendarBusy);
  const busyByDay = showImportedCalendarBusy ? icsBusySlotsByDay(icsBusy ?? []) : new Map<number, Set<number>>();

  const onArrowIncrease = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 7);
    setStartDate(newDate);
  };

  const onArrowDecrease = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 7);
    setStartDate(newDate);
  };

  const stickyLeft = {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    bgcolor: 'background.paper'
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {showImportedCalendarBusy && (
        <Typography variant="caption" color="text.secondary" mb={1}>
          Hatched slots are busy on your imported calendar. Edit your availability and use "Fill from external calendar" to
          pull in any changes.
        </Typography>
      )}
      <TableContainer
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          maxWidth: '100%',
          height: '100%',
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
              <TableCell sx={stickyLeft}></TableCell>
              {selectedTimes.map((availability, idx) => (
                <TableCell key={idx}>
                  <Typography variant="body1" align="center" fontWeight="bold" sx={{ fontSize: 15 }}>
                    {getDayOfWeek(availability.dateSet) + ' ' + datePipe(availability.dateSet)}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {enumToArray(REVIEW_TIMES).map((time, timeIndex) => (
              <TableRow key={time}>
                <TableCell sx={{ ...stickyLeft, zIndex: 1 }}>
                  <Typography variant="body1" align="center" sx={{ fontSize: 15 }}>
                    {time}
                  </Typography>
                </TableCell>
                {selectedTimes.map((availability, dayIndex) => {
                  const isAvailable = availability.availability.includes(timeIndex);
                  return (
                    <TableCell key={dayIndex} sx={{ p: 0 }}>
                      <EventTimeSlot
                        backgroundColor={isAvailable ? getBackgroundColor(1, 1) : getBackgroundColor(0, 1)}
                        selected={false}
                        busy={isSlotBusy(busyByDay, availability.dateSet, timeIndex)}
                        onClick={() => {}}
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="center" width="100%" mt={2}>
        <NERArrows onRightArrowPressed={onArrowIncrease} onLeftArrowPressed={onArrowDecrease} />
      </Box>
    </Box>
  );
};

export default SingleAvailabilityView;
