import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Availability, getDayOfWeek, getMostRecentAvailabilities } from 'shared';
import { datePipe } from '../../../../utils/pipes';
import { useState, useEffect } from 'react';
import NERArrows from '../../../../components/NERArrows';
import { enumToArray, REVIEW_TIMES, getBackgroundColor } from '../../../../utils/design-review.utils';
import EventTimeSlot from '../../../NewCalendarPage/Components/EventTimeSlot';

interface SingleAvailabilityViewProps {
  totalAvailability: Availability[];
  initialDate?: Date;
}

const SingleAvailabilityView: React.FC<SingleAvailabilityViewProps> = ({ totalAvailability, initialDate }) => {
  const [startDate, setStartDate] = useState<Date>(initialDate || new Date());

  useEffect(() => {
    if (initialDate) {
      setStartDate(initialDate);
    }
  }, [initialDate]);

  const selectedTimes = getMostRecentAvailabilities(totalAvailability, startDate);

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
    <Box>
      <TableContainer
        sx={{
          overflowX: 'auto',
          overflowY: 'auto',
          maxWidth: '100%',
          maxHeight: 500
        }}
      >
        <Table
          stickyHeader
          size="small"
          sx={{
            '& .MuiTableCell-head': {
              bgcolor: 'background.paper'
            },
            minWidth: 800
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={stickyLeft}></TableCell>
              {selectedTimes.map((availability, idx) => (
                <TableCell key={idx}>
                  <Typography variant="body2" align="center" sx={{ fontSize: 12 }}>
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
                  <Typography variant="body2" align="center" sx={{ fontSize: 13 }}>
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
