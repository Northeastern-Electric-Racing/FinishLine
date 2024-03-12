import { Grid } from '@mui/material';
import NERModal from '../components/NERModal';
import TimeSlot from '../components/TimeSlot';
import { useState } from 'react';
import { HeatmapColors, DAY_NAMES, REVIEW_TIMES, EnumToArray } from '../utils/design-review.utils';
import { User } from 'shared';

interface DRCEditModalProps {
  open: boolean;
  description: string;
  time: string;
  location: string;
  onHide: () => void;
  onSubmit?: () => void;
  usersToAvailabilities: Map<User, number[]>;
  existingMeetingData: Map<number, string>;
}

const DRCEditModal: React.FC<DRCEditModalProps> = ({
  open,
  onHide,
  onSubmit,
  description,
  time,
  location,
  existingMeetingData
}) => {
  const header = `Are you availble for the ${description} Design Review at ${time} in the ${location}`;
  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [itemSelected, setItemSelected] = useState(false);

  const handleMouseDown = (event: any, selectedTime: number) => {
    event.preventDefault();
    const isItemSelected = selectedTimes.includes(selectedTime);
    setItemSelected(isItemSelected);
    setSelectedTimes(
      isItemSelected ? selectedTimes.filter((time) => time !== selectedTime) : [...selectedTimes, selectedTime]
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
    setSelectedTimes((prevTimes) => {
      if (itemSelected) {
        return prevTimes.filter((time) => time !== selectedTime);
      } else {
        return prevTimes.includes(selectedTime) ? prevTimes : [...prevTimes, selectedTime];
      }
    });
  };

  const renderDayHeaders = () => {
    return [
      <TimeSlot backgroundColor={HeatmapColors.zero} isModal={true} />,
      EnumToArray(DAY_NAMES).map((day) => (
        <TimeSlot key={day} backgroundColor={HeatmapColors.zero} isModal={true} text={day} fontSize={'12px'} />
      ))
    ];
  };

  const renderSchedule = () => {
    return (
      <Grid container>
        {renderDayHeaders()}
        {EnumToArray(REVIEW_TIMES).map((time, timeIndex) => (
          <Grid container item xs={12}>
            <TimeSlot backgroundColor={HeatmapColors.zero} isModal={true} text={time} fontSize={'13px'} />
            {EnumToArray(DAY_NAMES).map((_day, dayIndex) => {
              const index = dayIndex * EnumToArray(REVIEW_TIMES).length + timeIndex;
              const backgroundColor = selectedTimes.includes(index) ? HeatmapColors.three : HeatmapColors.zero;
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

  return (
    <NERModal
      open={open}
      onHide={() => {
        onHide();
        setSelectedTimes([]);
      }}
      title={header}
      onSubmit={onSubmit}
    >
      {renderSchedule()}
    </NERModal>
  );
};

export default DRCEditModal;
