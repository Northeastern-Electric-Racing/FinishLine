import { Grid } from '@mui/material';
import { useState } from 'react';
import { HeatmapColors, EnumToArray, DAY_NAMES, REVIEW_TIMES } from '../utils/design-review.utils';
import TimeSlot from './TimeSlot';

interface EditScheduleProps {
  selectedTimes: number[];
  setSelectedTimes: (val: number[]) => void;
  existingMeetingData: Map<number, string>;
}

const EditSchedule: React.FC<EditScheduleProps> = ({ selectedTimes, setSelectedTimes, existingMeetingData }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isFirstItemSelected, setIsFirstItemSelected] = useState(false);

  const handleMouseDown = (event: any, selectedTime: number) => {
    event.preventDefault();
    const isCurrentItemSelected = selectedTimes.includes(selectedTime);
    setIsFirstItemSelected(isCurrentItemSelected);
    setSelectedTimes(
      isCurrentItemSelected ? selectedTimes.filter((time) => time !== selectedTime) : [...selectedTimes, selectedTime]
    );
    setIsDragging(true);
  };

  const handleMouseEnter = (event: any, selectedTime: number) => {
    if (!isDragging) return;
    toggleTimeSlot(selectedTime);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const toggleTimeSlot = (selectedTime: number) => {
    let newSelectedTimes: number[];

    isFirstItemSelected
      ? (newSelectedTimes = selectedTimes.filter((time) => time !== selectedTime))
      : (newSelectedTimes = selectedTimes.includes(selectedTime) ? selectedTimes : [...selectedTimes, selectedTime]);

    setSelectedTimes(newSelectedTimes);
  };

  return (
    <Grid container>
      <TimeSlot backgroundColor={HeatmapColors[0]} isModal={true} />
      {EnumToArray(DAY_NAMES).map((day) => (
        <TimeSlot key={day} backgroundColor={HeatmapColors[0]} isModal={true} text={day} fontSize={'12px'} />
      ))}
      {EnumToArray(REVIEW_TIMES).map((time, timeIndex) => (
        <Grid container item xs={12}>
          <TimeSlot backgroundColor={HeatmapColors[0]} isModal={true} text={time} fontSize={'13px'} />
          {EnumToArray(DAY_NAMES).map((_day, dayIndex) => {
            const index = dayIndex * EnumToArray(REVIEW_TIMES).length + timeIndex;
            const backgroundColor = selectedTimes.includes(index) ? HeatmapColors[3] : HeatmapColors[0];
            return (
              <TimeSlot
                key={index}
                backgroundColor={backgroundColor}
                isModal={true}
                onMouseDown={(e) => handleMouseDown(e, index)}
                onMouseEnter={(e) => handleMouseEnter(e, index)}
                onMouseUp={handleMouseUp}
                icon={existingMeetingData.get(index)}
              />
            );
          })}
        </Grid>
      ))}
    </Grid>
  );
};

export default EditSchedule;
