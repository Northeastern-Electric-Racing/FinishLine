import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { HeatmapColors, enumToArray, REVIEW_TIMES } from '../../../../utils/design-review.utils';
import { addDaysToDate, Availability, getDayOfWeek, getMostRecentAvailabilities } from 'shared';
import { datePipe } from '../../../../utils/pipes';
import NERArrows from '../../../../components/NERArrows';
import { NERButton } from '../../../../components/NERButton';
import EventTimeSlot from '../../../CalendarPage/Components/EventTimeSlot';

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
  const [currentlyDisplayedAvailabilities, setCurrentlyDisplayedAvailabilities] = useState(() => {
    const availabilities = Array.from(editedAvailabilities.values());
    if (availabilities.length === 0) {
      // Load existing availabilities instead of creating empty ones
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

  const [displayedDate, setDisplayedDate] = useState(initialDate);

  const handleMouseDown = (event: any, availability: Availability, selectedTime: number) => {
    event.preventDefault();
    toggleTimeSlot(availability, selectedTime);
    setIsDragging(true);
  };

  const increaseDateRange = () => {
    const lastDate = currentlyDisplayedAvailabilities[currentlyDisplayedAvailabilities.length - 1].dateSet;
    const newDate = addDaysToDate(lastDate, 1);
    setDisplayedDate(newDate);

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
    setDisplayedDate(newDate);

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

  const toggleTimeSlot = (availability: Availability, selectedTime: number) => {
    availability.availability.includes(selectedTime)
      ? availability.availability.splice(availability.availability.indexOf(selectedTime), 1)
      : availability.availability.push(selectedTime);

    editedAvailabilities.set(availability.dateSet.getTime(), availability);
    setEditedAvailabilities(editedAvailabilities);

    setCurrentlyDisplayedAvailabilities(
      getMostRecentAvailabilities(Array.from(editedAvailabilities.values()), displayedDate)
    );
  };

  const stickyLeft = {
    position: 'sticky',
    left: 0,
    zIndex: 2,
    bgcolor: 'background.paper'
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box display="flex" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle1">Available times in green</Typography>
        <NERButton variant="outlined" onClick={invertAvailabilities}>
          Invert Availability
        </NERButton>
      </Box>

      <TableContainer
        sx={{
          overflowX: 'auto',
          overflowY: 'hidden',
          maxWidth: '100%',
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
              {currentlyDisplayedAvailabilities.map((availability, idx) => (
                <TableCell key={idx}>
                  <Typography variant="body1" align="center" fontWeight="bold" sx={{ fontSize: 15 }}>
                    {getDayOfWeek(availability.dateSet)}
                    <br />
                    {datePipe(availability.dateSet)}
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
                {currentlyDisplayedAvailabilities.map((availability, dayIndex) => {
                  const isAvailable = availability.availability.includes(timeIndex);
                  return (
                    <TableCell key={dayIndex} sx={{ p: 0 }}>
                      <EventTimeSlot
                        backgroundColor={isAvailable ? HeatmapColors[3] : HeatmapColors[0]}
                        selected={false}
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
