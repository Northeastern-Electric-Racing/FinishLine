import { Grid } from '@mui/material';
import NERModal from '../components/NERModal';
import { DRCModalProps, getBackgroundColor, times, daysOfWeek, TimeSlot } from './DesignReviewCommon';
import { useState } from 'react';

const DRCEditModal: React.FC<DRCModalProps> = ({ open, onHide, onSubmit, title, currentUser }) => {
  const header = `Are you availble for the ${title} Design Review at 9:00 in the Bay`;
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

  const timeslotData = new Map<number, string>();
  timeslotData.set(5, 'warning');
  timeslotData.set(6, 'build');
  timeslotData.set(7, 'computer');
  timeslotData.set(8, 'electrical');

  const handleMouseEnter = (event: any, selectedTime: number) => {
    if (!isDragging) return;
    toggleTimeSlot(selectedTime);
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

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetSelectedTimes = () => setSelectedTimes([]);

  const renderDayHeaders = () => {
    return [
      <TimeSlot backgroundColor={getBackgroundColor(0)} isModal={true} />,
      daysOfWeek.map((day) => (
        <TimeSlot key={day} backgroundColor={getBackgroundColor()} isModal={true} text={day} fontSize={'12px'} />
      ))
    ];
  };

  const renderSchedule = () => {
    return (
      <Grid container>
        {renderDayHeaders()}
        {times.map((time, timeIndex) => (
          <Grid container item xs={12}>
            <TimeSlot backgroundColor={getBackgroundColor()} isModal={true} text={time} fontSize={'13px'} />
            {daysOfWeek.map((_day, dayIndex) => {
              const index = dayIndex * times.length + timeIndex;
              const backgroundColor = selectedTimes.includes(index) ? getBackgroundColor(3) : getBackgroundColor(0);
              return (
                <TimeSlot
                  key={index}
                  backgroundColor={backgroundColor}
                  isModal={true}
                  onMouseDown={(e) => handleMouseDown(e, index)}
                  onMouseEnter={(e) => handleMouseEnter(e, index)}
                  onMouseUp={handleMouseUp}
                  icon={timeslotData.get(index)}
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
        resetSelectedTimes();
      }}
      title={header}
      onSubmit={onSubmit}
    >
      {renderSchedule()}
    </NERModal>
  );
};

export default DRCEditModal;
