import { Grid } from '@mui/material';
import NERModal from '../components/NERModal';
import { DRCModalProps, getBackgroundColor, times, daysOfWeek, TimeSlot } from './DesignReviewCommon';
import { useState } from 'react';

const DRCEditModal: React.FC<DRCModalProps> = ({ open, onHide, onSubmit, title, currentUser }) => {
  const header = `Are you availble for the ${title} Design Review`;

  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [itemSelected, setItemSelected] = useState(false);

  const handleMouseDown = (event: any, selectedTime: number) => {
    const isTimeAlreadySelected = selectedTimes.includes(selectedTime);
    setItemSelected(!isTimeAlreadySelected);
    setIsDragging(true);
    toggleTimeSlot(selectedTime, !isTimeAlreadySelected);
  };

  const handleMouseEnter = (event: any, selectedTime: number) => {
    if (!isDragging) return;
    toggleTimeSlot(selectedTime, itemSelected);
    event.preventDefault();
  };

  const toggleTimeSlot = (selectedTime: number, addTime: boolean) => {
    setSelectedTimes((prevTimes) => {
      if (addTime) {
        return prevTimes.includes(selectedTime) ? prevTimes : [...prevTimes, selectedTime];
      } else {
        return prevTimes.filter((time) => time !== selectedTime);
      }
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetSelectedTimes = () => setSelectedTimes([]);

  const renderDayHeaders = () => {
    return [
      <TimeSlot backgroundColor={getBackgroundColor(0)} />,
      daysOfWeek.map((day) => <TimeSlot key={day} backgroundColor={getBackgroundColor()} text={day} fontSize={12} />)
    ];
  };

  const renderSchedule = () => {
    return times.map((time, timeIndex) => (
      <Grid container item xs={12}>
        <TimeSlot backgroundColor={getBackgroundColor()} text={time} fontSize={13} />
        {daysOfWeek.map((_day, dayIndex) => {
          const index = dayIndex * times.length + timeIndex;
          const backgroundColor = selectedTimes.includes(index) ? getBackgroundColor(4) : getBackgroundColor(0);
          return (
            <TimeSlot
              key={index}
              backgroundColor={backgroundColor}
              onMouseDown={(e) => handleMouseDown(e, index)}
              onMouseEnter={(e) => handleMouseEnter(e, index)}
              onMouseUp={handleMouseUp}
            />
          );
        })}
      </Grid>
    ));
  };

  return (
    <NERModal
      open={open}
      onHide={() => {
        onHide();
        resetSelectedTimes();
      }}
      title={header}
      onSubmit={onSubmit}
    >
      <Grid container>
        {renderDayHeaders()}
        {renderSchedule()}
      </Grid>
    </NERModal>
  );
};

export default DRCEditModal;
