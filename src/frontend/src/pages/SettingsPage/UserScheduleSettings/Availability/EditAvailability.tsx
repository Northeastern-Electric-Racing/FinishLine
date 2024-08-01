import { Grid } from '@mui/material';
import { useState } from 'react';
import { HeatmapColors, EnumToArray, REVIEW_TIMES, ExistingMeetingData } from '../../../../utils/design-review.utils';
import TimeSlot from '../../../../components/TimeSlot';
import { addDaysToDate, Availability, getDayOfWeek, getMostRecentAvailabilities } from 'shared';
import { datePipe } from '../../../../utils/pipes';
import NERArrows from '../../../../components/NERArrows';

interface EditAvailabilityProps {
  selectedAvailabilities: Availability[];
  setSelectedAvailabilities: (val: Availability[]) => void;
  existingMeetingData: ExistingMeetingData;
  totalAvailabilities: Availability[];
  canChangeDateRange?: boolean;
}

const EditAvailability: React.FC<EditAvailabilityProps> = ({
  selectedAvailabilities,
  setSelectedAvailabilities,
  totalAvailabilities,
  existingMeetingData,
  canChangeDateRange = true
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (event: any, availability: Availability, selectedTime: number) => {
    event.preventDefault();

    const isCurrentItemSelected = availability.availability.includes(selectedTime);
    isCurrentItemSelected
      ? availability.availability.splice(availability.availability.indexOf(selectedTime), 1)
      : availability.availability.push(selectedTime);
    setSelectedAvailabilities([...selectedAvailabilities]);
    setIsDragging(true);
  };

  const increaseDateRange = () => {
    const lastDate = selectedAvailabilities[selectedAvailabilities.length - 1].dateSet;
    const newDate = addDaysToDate(lastDate, 1);
    setSelectedAvailabilities(getMostRecentAvailabilities(totalAvailabilities, newDate));
  };

  const decreaseDateRange = () => {
    const firstDate = selectedAvailabilities[0].dateSet;
    const newDate = addDaysToDate(firstDate, -7);
    console.log(newDate);
    setSelectedAvailabilities(getMostRecentAvailabilities(totalAvailabilities, newDate));
  };

  const handleMouseEnter = (_event: any, availability: Availability, selectedTime: number) => {
    if (!isDragging) return;
    toggleTimeSlot(availability, selectedTime);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleTimeSlot = (availability: Availability, selectedTime: number) => {
    availability.availability.includes(selectedTime)
      ? availability.availability.splice(availability.availability.indexOf(selectedTime), 1)
      : availability.availability.push(selectedTime);
    setSelectedAvailabilities([...selectedAvailabilities]);
  };

  return (
    <Grid container>
      <TimeSlot backgroundColor={HeatmapColors[0]} small={true} heightOverride="40px" />
      {selectedAvailabilities.map((availability) => (
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
          {selectedAvailabilities.map((availability, dayIndex) => {
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
