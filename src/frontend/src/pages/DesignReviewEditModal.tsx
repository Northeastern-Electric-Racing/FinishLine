import { Grid } from '@mui/material';
import NERModal from '../components/NERModal';
import { DRCModalProps, getBackgroundColor, times, daysOfWeek, TimeSlot } from './DesignReviewCommon';
import { useState } from 'react';

const DRCEditModal: React.FC<DRCModalProps> = ({ open, onHide, onSubmit, title, currentUser }) => {
  const header = `Are you availble for the ${title} Design Review`;

  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);
  
  const handleOnClick = (selectedTime: number) => {
    setSelectedTimes((prevTimes) =>
      prevTimes.includes(selectedTime) ? prevTimes.filter((time) => time !== selectedTime) : [...prevTimes, selectedTime]
    );
  };

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
          const backgroundColor = selectedTimes.includes(index) ? getBackgroundColor(1) : getBackgroundColor(0);
          return <TimeSlot key={index} backgroundColor={backgroundColor} onClick={() => handleOnClick(index)} />;
        })}
      </Grid>
    ));
  };

  return (
    <NERModal open={open} onHide={onHide} title={header} onSubmit={onSubmit}>
      <Grid container>
        {renderDayHeaders()}
        {renderSchedule()}
      </Grid>
    </NERModal>
  );
};

export default DRCEditModal;
