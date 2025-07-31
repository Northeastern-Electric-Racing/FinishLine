import { Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { HeatmapColors, EnumToArray, REVIEW_TIMES, ExistingMeetingData } from '../../../../utils/design-review.utils';
import TimeSlot from '../../../../components/TimeSlot';
import { addDaysToDate, Availability, getDayOfWeek, getMostRecentAvailabilities } from 'shared';
import { datePipe } from '../../../../utils/pipes';
import NERArrows from '../../../../components/NERArrows';
import { NERButton } from '../../../../components/NERButton';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';

interface EditAvailabilityProps {
  editedAvailabilities: Map<number, Availability>;
  setEditedAvailabilities: (val: Map<number, Availability>) => void;
  existingMeetingData: ExistingMeetingData;
  totalAvailabilities: Availability[];
  initialDate: Date;
  canChangeDateRange?: boolean;
}

const EditAvailability: React.FC<EditAvailabilityProps> = ({
  editedAvailabilities,
  totalAvailabilities,
  setEditedAvailabilities,
  existingMeetingData,
  initialDate,
  canChangeDateRange = true
}) => {
  const [currentlyDisplayedAvailabilities, setCurrentlyDisplayedAvailabilities] = useState(
    getMostRecentAvailabilities(Array.from(editedAvailabilities.values()), initialDate)
  );

  const [isDragging, setIsDragging] = useState(false);

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
    currentlyDisplayedAvailabilities.map((availability) => {
      EnumToArray(REVIEW_TIMES).map((_time, timeIndex) => {
        toggleTimeSlot(availability, timeIndex);
      });
    });
  };

  const toggleTimeSlot = (availability: Availability, selectedTime: number) => {
    availability.availability.includes(selectedTime)
      ? availability.availability.splice(availability.availability.indexOf(selectedTime), 1)
      : availability.availability.push(selectedTime);

    editedAvailabilities.set(availability.dateSet.getTime(), availability);
    setEditedAvailabilities(editedAvailabilities);

    setCurrentlyDisplayedAvailabilities(getMostRecentAvailabilities(Array.from(editedAvailabilities.values()), initialDate));
  };

  return (
    <Grid container>
      <Grid container justifyContent="space-between" mb={1}>
        <Typography display={'flex'} justifyContent={'flex-start'} mt={1} variant="subtitle1">
          Available times in red
        </Typography>
        <NERButton variant="outlined" sx={{ display: 'flex', justifyContent: 'flex-end' }} onClick={invertAvailabilities}>
          Invert Availability
        </NERButton>
      </Grid>
      <TimeSlot backgroundColor={HeatmapColors[0]} small={true} heightOverride="40px" />
      {currentlyDisplayedAvailabilities.map((availability) => (
        <TimeSlot
          key={availability.dateSet.getTime()}
          backgroundColor={HeatmapColors[0]}
          small={true}
          heightOverride="40px"
          text={getDayOfWeek(availability.dateSet) + ' ' + datePipe(availability.dateSet)}
          fontSize={'12px'}
        />
      ))}
      {EnumToArray(REVIEW_TIMES).map((time, timeIndex) => (
        <Grid container item>
          <TimeSlot backgroundColor={HeatmapColors[0]} small={true} text={time} fontSize={'13px'} />
          {currentlyDisplayedAvailabilities.map((availability, dayIndex) => {
            const backgroundColor = availability.availability.includes(timeIndex) ? HeatmapColors[3] : HeatmapColors[0];
            return (
              <TimeSlot
                key={timeIndex * EnumToArray(REVIEW_TIMES).length + dayIndex}
                backgroundColor={backgroundColor}
                small={true}
                onMouseDown={(e) => handleMouseDown(e, availability, timeIndex)}
                onMouseEnter={(e) => handleMouseEnter(e, availability, timeIndex)}
                onMouseUp={handleMouseUp}
                icon={existingMeetingData.get(dayIndex)?.iconMap.get(timeIndex)}
              />
            );
          })}
        </Grid>
      ))}
      {canChangeDateRange && (
        <Grid item xs={12}>
          <NERArrows onLeftArrowPressed={decreaseDateRange} onRightArrowPressed={increaseDateRange} />
        </Grid>
      )}
    </Grid>
  );
};

export default EditAvailability;
